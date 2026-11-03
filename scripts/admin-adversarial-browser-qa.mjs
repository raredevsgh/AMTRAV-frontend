// Actual rapid-input and duplicate-submit checks against the explicitly enabled local demo.
import assert from "node:assert/strict";
import {mkdirSync,readFileSync,writeFileSync} from "node:fs";
import {join} from "node:path";
const {chromium,webkit}=await import(process.env.AMTRAV_PLAYWRIGHT_MODULE || "playwright");
const base=process.env.AMTRAV_CONSOLE_URL || "http://127.0.0.1:3151";
const output=process.env.AMTRAV_CONSOLE_OUTPUT || "evidence/admin-adversarial-browser";
const results=[],browsers=[];
mkdirSync(output,{recursive:true});
for(const engine of ["chromium","webkit"]) {
  const browser=engine==="chromium" ? await chromium.launch({channel:"chrome",headless:true}) : await webkit.launch({headless:true});
  browsers.push({engine,version:browser.version()});
  const context=await browser.newContext({viewport:{width:1440,height:900}});
  await context.addCookies([{name:"amtrav_console_demo",value:"admin",url:base,httpOnly:true,sameSite:"Strict"}]);
  const page=await context.newPage(),errors=[];page.setDefaultTimeout(10000);
  page.on("pageerror",error=>errors.push(String(error)));
  const ready=async route=>{await page.goto(base+route);await page.locator("main h1").first().waitFor();await page.locator(".loading-state").waitFor({state:"detached"});};
  try {
    await ready("/devices");
    const search=page.getByLabel("Search devices",{exact:true});
    for(const query of ["missing","AMT-EX"," ","AMT-ES55-5A06B3"])await search.fill(query);
    await page.waitForFunction(()=>document.querySelectorAll("tbody tr").length===1);
    assert.ok((await page.locator("tbody").innerText()).includes("AMT-ES55-5A06B3"));
    results.push({name:engine+": rapid search settles on the final query",passed:true});
    await ready("/devices/10000000-0000-4000-8000-000000000003");
    await page.locator(".record-actions summary").click();
    await page.getByRole("button",{name:"Revoke device",exact:true}).click();
    await page.getByLabel("I understand this can’t be undone",{exact:true}).check();
    await page.getByRole("dialog").getByRole("button",{name:"Revoke device",exact:true}).dblclick();
    await page.locator(".record-state").filter({hasText:"Revoked"}).waitFor();
    await page.getByRole("tab",{name:"Audit",exact:true}).click();
    await page.getByText("revoked",{exact:true}).waitFor();
    assert.doesNotMatch(await page.locator("main").innerText(),/\bdemo\b|\bfictional\b|\bsimulated\b/i);
    assert.equal(await page.getByText("revoked",{exact:true}).count(),1,"Rapid clicks must not duplicate the mutation audit");
    await page.mouse.move(0,0);
    await page.screenshot({path:join(output,engine+"-single-revoke-audit.png"),fullPage:true});
    results.push({name:engine+": double-click revoke produces exactly one audit event",passed:true});
    await page.reload();await page.locator(".device-detail").waitFor();await page.locator(".loading-state").waitFor({state:"detached"});
    assert.equal(await page.locator(".record-state").count(),0);
    assert.equal(await page.getByText("revoked",{exact:true}).count(),0);
    assert.equal(await page.getByRole("tab",{name:"Audit",exact:true}).getAttribute("aria-selected"),"true");
    assert.deepEqual(errors,[]);
    results.push({name:engine+": refresh preserves the tab and restores documented in-memory fixtures",passed:true});
  } catch(error) {
    results.push({name:engine+": rapid-interaction workflow",passed:false,error:String(error.stack || error),browserErrors:errors});
    await page.screenshot({path:join(output,engine+"-failure.png"),fullPage:true}).catch(()=>{});
  } finally {await context.close();await browser.close();}
}
writeFileSync(join(output,"results.json"),JSON.stringify({status:"complete",completedAt:new Date().toISOString(),buildId:readFileSync("admin_panel/.next/BUILD_ID","utf8").trim(),scope:"Actual browser interactions against fictional local fixtures; no production capability implied",browsers,results},null,2));
console.log(JSON.stringify({checks:results.length,failed:results.filter(item=>!item.passed)},null,2));
if(results.some(item=>!item.passed))process.exitCode=1;
