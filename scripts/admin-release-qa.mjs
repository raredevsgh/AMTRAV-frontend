// Current release acceptance: clean Admin UI with temporary sample data and one demo login.
import assert from "node:assert/strict";
import {mkdirSync,writeFileSync} from "node:fs";
import {join} from "node:path";
import {readFile} from "node:fs/promises";
const {chromium,webkit}=await import(process.env.AMTRAV_PLAYWRIGHT_MODULE || "playwright");
const base=process.env.AMTRAV_CONSOLE_URL || "http://127.0.0.1:3151";
const closed=process.env.AMTRAV_CONSOLE_CLOSED_URL || "http://127.0.0.1:3152";
const output=process.env.AMTRAV_CONSOLE_OUTPUT || "evidence/admin-release-2026-11-03/flows";
const results=[],accessibility=[],measurements=[],browsers=[];
mkdirSync(output,{recursive:true});
const save=complete=>writeFileSync(join(output,"results.json"),JSON.stringify({status:complete?"complete":"running",browsers,results,accessibility,measurements},null,2));
for(const engine of (process.env.AMTRAV_CONSOLE_ENGINES || "chromium,webkit").split(",")) {
  const browser=engine==="chromium" ? await chromium.launch({channel:"chrome",headless:true}) : await webkit.launch({headless:true});
  browsers.push({engine,version:browser.version()});
  async function run(name,fn,role="admin",width=1440,authenticated=true) {
    if(process.env.AMTRAV_QA_CASE && !name.includes(process.env.AMTRAV_QA_CASE))return;
    const context=await browser.newContext({viewport:{width,height:900},acceptDownloads:true});
    if(authenticated)await context.addCookies([{name:"amtrav_console_demo",value:role,url:base,httpOnly:true,sameSite:"Strict"}]);
    const page=await context.newPage(),errors=[],networkFailures=[];page.on("requestfailed",request=>networkFailures.push({url:request.url(),failure:request.failure(),type:request.resourceType()}));page.setDefaultTimeout(10000);page.on("pageerror",error=>errors.push(String(error)));
    const ready=async route=>{await page.waitForLoadState("networkidle");await page.goto(base+route);await page.locator("main h1").first().waitFor();await page.locator(".loading-state").waitFor({state:"detached"});await page.evaluate(()=>document.fonts.ready);await page.waitForLoadState("networkidle");if(route!=="/login")assert.doesNotMatch(await page.locator("main").innerText(),/\bdemo\b|\bfictional\b|\bsimulated\b|\bpreview\b/i);};
    const shot=async label=>{await page.mouse.move(0,0);await page.screenshot({path:join(output,`${engine}-${role}-${width}-${label}.png`),fullPage:true,mask:[page.getByTestId("claim-code")]});};
    const audit=async label=>{if(!process.env.AMTRAV_AXE_PATH)return;await page.addScriptTag({path:process.env.AMTRAV_AXE_PATH});const report=await page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}});return {violations:r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,reason:n.failureSummary}))})),incomplete:r.incomplete.map(v=>v.id)};});accessibility.push({engine,role,width,label,...report});assert.deepEqual(report.violations,[]);};
    try {await fn(page,ready,shot,audit);assert.deepEqual(errors,[]);results.push({engine,role,width,name,passed:true});}
    catch(error){results.push({engine,role,width,name,passed:false,error:String(error.stack||error),browserErrors:errors,networkFailures});await shot("failure-"+name.replaceAll(/[^a-z0-9]+/gi,"-")).catch(()=>{});}
    finally {await context.close();save(false);}
  }
  await run("Single demo login, validation and clean workspace",async(page,ready,shot,audit)=>{
    await ready("/login");assert.equal(await page.getByRole("button",{name:"Demo login",exact:true}).count(),1);
    assert.equal(await page.locator(".demo-access,.demo-quick-login").count(),0);await shot("login");
    await page.locator("#email").fill("invalid");await page.getByRole("button",{name:"Demo login",exact:true}).click();await page.getByText("Enter a valid work email address.",{exact:true}).waitFor();
    await page.locator("#email").fill("qa@example.invalid");await page.getByRole("button",{name:"Demo login",exact:true}).click();await page.waitForURL("**/devices");await page.locator("tbody tr").first().waitFor();
    assert.equal(await page.locator(".demo-banner,.demo-controls-panel").count(),0);await audit("Clean signed-in workspace");
  },"admin",1440,false);
  await run("Disabled authentication rejects forged login cookie",async(page,ready,shot)=>{
    await page.context().addCookies([{name:"amtrav_console_demo",value:"admin",url:closed,httpOnly:true}]);await page.goto(closed+"/devices");await page.waitForURL("**/login?reason=session");
    assert.equal(await page.getByRole("button",{name:"Demo login",exact:true}).count(),0);await shot("closed-login");
  });
  for(const width of [320,390,768,1440,1920])for(const role of ["admin","manufacturer"])await run("Settings typography, padding, feedback and role permissions",async(page,ready,shot,audit)=>{
    await ready("/settings");assert.equal(await page.getByRole("button",{name:/Reset demo/}).count(),0);assert.equal(await page.getByLabel(/Theme preference/).count(),0);
    const geometry=await page.evaluate(()=>{const box=element=>{const r=element.getBoundingClientRect();return {top:r.top,bottom:r.bottom,left:r.left,right:r.right};};const header=document.querySelector(".page-header"),panel=document.querySelector(".settings-form .panel"),root=document.querySelector(".console-root"),legend=document.querySelector("legend");return {headerPosition:getComputedStyle(header).position,bodyFont:getComputedStyle(root).fontSize,bodyLine:getComputedStyle(root).lineHeight,headingFont:getComputedStyle(document.querySelector("h1")).fontSize,panelPadding:getComputedStyle(panel).paddingLeft,panel:box(panel),legend:box(legend),checkboxRows:[...document.querySelectorAll(".settings-checks label")].map(box)};});measurements.push({engine,role,width,...geometry});
    assert.equal(geometry.headerPosition,"relative");assert.equal(geometry.bodyFont,"14px");assert.equal(geometry.bodyLine,"20px");assert.equal(geometry.headingFont,width<=480?"26px":width<=1023?"28px":"34px");assert.equal(geometry.panelPadding,width<=600?"16px":"24px");
    for(let i=1;i<geometry.checkboxRows.length;i++)assert.ok(geometry.checkboxRows[i].top-geometry.checkboxRows[i-1].bottom>=15);
    await shot("settings");await audit("Settings form");
    if(role==="manufacturer") {assert.ok(await page.getByLabel("Telemetry ping interval",{exact:true}).isDisabled());assert.equal(await page.getByRole("button",{name:"Save changes",exact:true}).count(),0);return;}
    await page.getByLabel("Telemetry ping interval",{exact:true}).selectOption("30");await page.getByLabel("Maintenance mode",{exact:true}).check();await page.getByRole("button",{name:"Save changes",exact:true}).click();await page.getByText("Settings saved.",{exact:true}).waitFor();
    await page.evaluate(()=>scrollTo(0,0));const boxes=await page.evaluate(()=>{const h=document.querySelector(".page-header").getBoundingClientRect(),n=document.querySelector(".notice-success").getBoundingClientRect(),f=document.querySelector("fieldset").getBoundingClientRect();return {headerBottom:h.bottom,noticeTop:n.top,noticeBottom:n.bottom,formTop:f.top};});assert.ok(boxes.noticeTop>=boxes.headerBottom+12);assert.ok(boxes.formTop>=boxes.noticeBottom+12);
    await shot("settings-saved");await audit("Settings saved without overlap");
    await page.evaluate(()=>scrollTo(0,500));const headingY=await page.locator(".page-header").evaluate(element=>element.getBoundingClientRect().top);if(await page.evaluate(()=>scrollY>0))assert.ok(headingY<0,"Header must scroll with content rather than overlay notices");
  },role,width);
  await run("Mobile navigation, Escape focus restoration and sign-out",async(page,ready,shot,audit)=>{
    await ready("/devices");const menu=page.getByRole("button",{name:"Open navigation menu",exact:true});await menu.click();await page.getByRole("dialog",{name:"Workspace navigation",exact:true}).waitFor();await audit("Mobile navigation");await shot("navigation");await page.keyboard.press("Escape");assert.ok(await menu.evaluate(element=>element===document.activeElement));await menu.click();await page.getByRole("dialog").getByRole("link",{name:"Settings",exact:true}).click();await page.getByRole("heading",{name:"Settings",exact:true}).waitFor();await page.locator(".loading-state").waitFor({state:"detached"});assert.equal(await page.getByRole("dialog").count(),0);await page.getByRole("button",{name:"Open navigation menu",exact:true}).click();await page.getByRole("dialog").getByRole("button",{name:"Sign out",exact:true}).click();await page.waitForURL("**/login");await page.getByRole("button",{name:"Demo login",exact:true}).waitFor();
  },"admin",320);
  await run("Registry search, filters and normal pagination",async(page,ready,shot,audit)=>{
    await ready("/devices");assert.equal(await page.locator("tbody tr").count(),13);await page.getByLabel("Search devices",{exact:true}).fill("missing");await page.getByRole("heading",{name:"No devices match these filters",exact:true}).waitFor();await page.getByLabel("Search devices",{exact:true}).fill("");await page.getByLabel("Page size",{exact:true}).selectOption("5");assert.equal(await page.locator("tbody tr").count(),5);await page.getByRole("button",{name:"Next page",exact:true}).click();assert.equal(await page.locator("tbody tr").count(),5);await page.getByRole("button",{name:"Previous page",exact:true}).click();await page.getByLabel("Page size",{exact:true}).selectOption("50");
    await page.locator(".device-all-filters > summary").click();await page.getByLabel("Reference",{exact:true}).check();assert.equal(await page.locator("tbody tr").count(),3);await page.keyboard.press("Escape");await page.getByRole("button",{name:"Clear filters",exact:true}).click();assert.equal(await page.locator("tbody tr").count(),13);await shot("devices");await audit("Registry filters");
  });
  await run("Details, service drawer and cleaned administrative confirmation",async(page,ready,shot,audit)=>{
    await ready("/devices/10000000-0000-4000-8000-000000000003");for(const tab of ["Alerts","Journeys","Location","Diagnostics","Audit","Summary"]) {await page.getByRole("tab",{name:tab,exact:true}).click();await page.getByRole("tabpanel").waitFor();}await shot("device-summary");
    await ready("/operations");await page.getByRole("button",{name:"View service record for AMT-EX55-A042F8",exact:true}).click();await page.getByRole("dialog").waitFor();await shot("service-record");await audit("Service record drawer");await page.keyboard.press("Escape");
    await ready("/operations?tab=admin&device=10000000-0000-4000-8000-000000000003");await page.getByRole("button",{name:"Suspend",exact:true}).click();await page.getByLabel("I understand this pauses registry updates",{exact:true}).check();await page.getByRole("button",{name:"Suspend device",exact:true}).click();await page.getByText("Device suspended",{exact:true}).waitFor();await page.getByRole("button",{name:"Resume",exact:true}).click();await page.getByText("Device resumed",{exact:true}).waitFor();await shot("operations-admin");

  });
  await run("Removed simulation route redirects without exposing tools",async(page,ready)=>{await ready("/operations/demo");assert.equal(new URL(page.url()).pathname,"/operations");assert.equal(await page.getByText("Demo Readings & Controls",{exact:true}).count(),0);});
  await run("Customer notes, alert status and journey disclosures",async(page,ready,shot,audit)=>{
    await ready("/customers/40000000-0000-4000-8000-000000000003");await page.locator("details:has(#customer-support-note) > summary").click();await page.getByLabel("Add support note",{exact:true}).fill("Release spacing audit note.");await page.getByRole("button",{name:"Add support note",exact:true}).click();await page.getByText("Release spacing audit note.",{exact:true}).waitFor();await shot("customer");
    await ready("/alerts/ALT-5098");await page.getByRole("button",{name:"Change status",exact:true}).click();await page.getByLabel("Status",{exact:true}).selectOption("resolved");await page.getByRole("dialog").getByLabel("Note",{exact:true}).fill("Reviewed during release QA.");await page.getByRole("dialog").getByRole("button",{name:"Save",exact:true}).click();await page.locator(".record-toast").filter({hasText:"Alert closed"}).waitFor();await shot("alert-closed");await audit("Alert success feedback");
    await ready("/journeys/JRN-2318");assert.equal(await page.locator(".local-demo-tool").count(),0);await page.locator(".journey-timeline details summary").first().click();assert.ok(await page.locator(".journey-timeline details[open]").count()>0);await shot("journey");
  });
  await run("Private file upload and download preserve content",async(page,ready,shot,audit)=>{
    await ready("/files");await page.locator('input[type="file"]').setInputFiles({name:"release-check.txt",mimeType:"text/plain",buffer:Buffer.from("AMORTRAV local file QA\n")});await page.getByRole("button",{name:"Upload selected file",exact:true}).click();await page.getByText("File saved.",{exact:true}).waitFor();const row=page.locator("tr").filter({hasText:"release-check.txt"});const downloadPromise=page.waitForEvent("download");await row.getByRole("button",{name:/Download/}).click();const download=await downloadPromise;assert.equal(download.suggestedFilename(),"release-check.txt");assert.equal(await readFile(await download.path(),"utf8"),"AMORTRAV local file QA\n");await shot("files");await audit("Private files");
  });
  await browser.close();
}
save(true);console.log(JSON.stringify({groups:results.length,failed:results.filter(item=>!item.passed),axeStates:accessibility.length},null,2));if(results.some(item=>!item.passed))process.exitCode=1;
