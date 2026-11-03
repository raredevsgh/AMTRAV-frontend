// Actual rendered-screen regression checks. This script does not simulate geometry.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
const { chromium, webkit } = await import(process.env.AMTRAV_PLAYWRIGHT_MODULE || "playwright");
const base = process.env.AMTRAV_CONSOLE_URL || "http://127.0.0.1:3151";
const output = process.env.AMTRAV_CONSOLE_OUTPUT || "evidence/admin-screen-qa";
const axePath = process.env.AMTRAV_AXE_PATH || "node_modules/.pnpm/axe-core@4.14.0/node_modules/axe-core/axe.min.js";
const widths = (process.env.AMTRAV_QA_WIDTHS || "320,375,390,430,768,1024,1280,1440,1920").split(",").map(Number);
const engines = (process.env.AMTRAV_CONSOLE_ENGINES || "chromium,webkit").split(",");
const roles = (process.env.AMTRAV_QA_ROLES || "admin,manufacturer").split(",");
const routes = process.argv.includes("--records") ? [
  ...Array.from({length:13},(_,index) => `/devices/10000000-0000-4000-8000-${String(index+1).padStart(12,"0")}`),
  ...Array.from({length:12},(_,index) => `/customers/40000000-0000-4000-8000-${String(index+1).padStart(12,"0")}`),
  ...[5127,5126,5124,5122,5119,5106,5098,5097,5096,4902,4871].map(id => `/alerts/ALT-${id}`),
  ...[2318,2315,2312,2309,2296,2301,2291,2289,2280,2204].map(id => `/journeys/JRN-${id}`),
] : ["/", "/devices", "/devices/new", "/devices/10000000-0000-4000-8000-000000000003", "/operations", "/journeys", "/journeys/JRN-2318", "/customers", "/customers/40000000-0000-4000-8000-000000000003", "/alerts", "/alerts/ALT-5127", "/manufacturers", "/files", "/users", "/settings", "/login"];
const results = [], measurements = [], accessibility = [];
mkdirSync(output, { recursive: true });
const check = (name, passed, detail) => results.push({name, passed: Boolean(passed), ...(passed ? {} : {detail})});
function save(complete=false) { writeFileSync(join(output, "results.json"), JSON.stringify({status:complete ? "complete" : "running",engines,roles,widths,routes,results, measurements, accessibility}, null, 2)); }
for (const engine of engines) {
  const browser = engine === "chromium" ? await chromium.launch({channel:"chrome",headless:true}) : await webkit.launch({headless:true});
  try {
    for (const width of widths) for (const role of roles) {
      const context = await browser.newContext({viewport:{width,height:900}});
      await context.addCookies([{name:"amtrav_console_demo",value:role,url:base,httpOnly:true,sameSite:"Strict"}]);
      const page = await context.newPage();
      page.setDefaultTimeout(10_000);
      const errors = [];
      page.on("pageerror", error => errors.push(String(error)));
      page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
      try {
        for (const route of routes) {
          await page.waitForLoadState("networkidle");
          errors.length = 0;
          const name = `${engine} ${role} ${width} ${route}`;
          try {
            await page.goto(base + route);
            await page.locator("main").first().waitFor();
            await page.waitForFunction(() => document.querySelectorAll("main").length === 1);
            await page.waitForFunction(() => {
              const main = document.querySelector("main");
              return main && !main.querySelector(".loading-state") && (main.querySelector("h1") || main.querySelector('[role="alert"]') || main.querySelector(".empty-state"));
            });
            await page.evaluate(() => document.fonts.ready);
            const state = await page.evaluate(() => {
              const hidden = document.querySelector(".sr-only");
              return {
                viewport:innerWidth, scrollWidth:document.documentElement.scrollWidth,
                typography:(()=>{const root=document.querySelector(".console-root"),heading=document.querySelector("main h1"),header=document.querySelector("main .page-header"),rect=header?.getBoundingClientRect();return root ? {body:getComputedStyle(root).fontSize,line:getComputedStyle(root).lineHeight,heading:heading?getComputedStyle(heading).fontSize:null,headerPosition:header?getComputedStyle(header).position:null,noticeOverlaps:rect?[...document.querySelectorAll("main .notice")].filter(node=>{const box=node.getBoundingClientRect();return box.top<rect.bottom && box.bottom>rect.top;}).length:0}:null;})(),
                main:document.querySelectorAll("main").length, h1:document.querySelectorAll("h1").length,
                tailwind:!hidden || (getComputedStyle(hidden).position === "absolute" && getComputedStyle(hidden).width === "1px"),
                clippedControls:[...document.querySelectorAll("main button, main input, main select")].flatMap(element => {
                  if (element.closest(".table-scroll") || element.closest("details:not([open])")) return [];
                  const tabs=element.closest(".console-tab-group");
                  if(tabs && getComputedStyle(tabs).overflowX === "auto" && tabs.scrollWidth > tabs.clientWidth)return [];
                  const rect = element.getBoundingClientRect();
                  return rect.width && rect.height && (rect.left < -1 || rect.right > innerWidth + 1) ? [{label:element.getAttribute("aria-label") || element.textContent?.trim().slice(0,80),left:rect.left,right:rect.right}] : [];
                }),
                tabScrollRegions:[...document.querySelectorAll(".console-tab-group")].map(element => {const rect=element.getBoundingClientRect();return {left:rect.left,right:rect.right,width:element.clientWidth,contentWidth:element.scrollWidth,overflow:getComputedStyle(element).overflowX};}),
              };
            });
            measurements.push({name,...state});
            check(name+": one main and h1",state.main===1 && state.h1===1,state);
            check(name+": no document overflow",state.scrollWidth<=state.viewport,state);
            check(name+": controls fit the viewport",state.clippedControls.length===0,state.clippedControls);
            check(name+": tab scroll regions fit the viewport",state.tabScrollRegions.every(region => region.left >= -1 && region.right <= state.viewport+1),state.tabScrollRegions);
            check(name+": utilities compiled",state.tailwind,state);
            check(name+": no browser errors",errors.length===0,[...errors]);
            if(route!=="/login")check(name+": shared typography and unobstructed feedback",state.typography?.body==="14px" && state.typography.line==="20px" && state.typography.heading===(width<=480?"26px":width<=1023?"28px":"34px") && (!state.typography.headerPosition || state.typography.headerPosition==="relative") && state.typography.noticeOverlaps===0,state.typography);
            if (route!=="/login") check(name+": no demo chrome",await page.locator(".demo-banner,.demo-access,.demo-quick-login,.local-demo-tool,.device-list-options").count()===0);
            await page.screenshot({path:join(output,`${engine}-${role}-${width}-${route==="/"?"overview":route.slice(1).replaceAll("/","-")}.png`),fullPage:true});
            if ((width===320 || width===1440) && role==="admin") {
              await page.addScriptTag({path:axePath});
              const audit = await page.evaluate(async()=>{
                const report=await axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}});
                return {violations:report.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,reason:n.failureSummary}))})),incomplete:report.incomplete.map(v=>v.id)};
              });
              accessibility.push({name,...audit});
              check(name+": axe",audit.violations.length===0,audit.violations);
            }
          } catch (error) { check(name+": screen rendered",false,String(error.stack||error)); }
          save();
        }
      } finally {await context.close();}
    }
  } finally {await browser.close();save();}
}
save(true);
const failed=results.filter(result=>!result.passed);
console.log(JSON.stringify({checks:results.length,failed:failed.length,failures:failed.map(result=>result.name),axeStates:accessibility.length,output},null,2));
process.exitCode=failed.length?1:0;
