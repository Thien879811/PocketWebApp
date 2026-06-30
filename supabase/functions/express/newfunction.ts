
// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// import OpenAI from "npm:openai";
// import { createClient } from "npm:@supabase/supabase-js";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
//   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
// };

// const formatDate = (date: Date) => {
//   const y = date.getFullYear();
//   const m = String(date.getMonth() + 1).padStart(2, "0");
//   const d = String(date.getDate()).padStart(2, "0");
//   return `${y}-${m}-${d}`;
// };

// Deno.serve(async (req: Request): Promise<Response> => {
//   if (req.method === "OPTIONS") return new Response("ok",{headers:corsHeaders});

//   try {
//     const url=new URL(req.url);

//     if(url.pathname.endsWith("/test")){
//       return new Response(JSON.stringify({status:"ok"}),{
//         headers:{...corsHeaders,"Content-Type":"application/json"}
//       });
//     }

//     const supabase=createClient(
//       Deno.env.get("SUPABASE_URL")!,
//       Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
//     );

//     const now=new Date();
//     const start=new Date(now.getFullYear(),now.getMonth(),1);
//     const next=new Date(now.getFullYear(),now.getMonth()+1,1);

//     const {data,error}=await supabase
//       .from("transactions")
//       .select(`
//         *,
//         categories(
//           id,
//           name,
//           type,
//           color,
//           icon
//         )
//       `)
//       .gte("date",formatDate(start))
//       .lt("date",formatDate(next));

//     if(error) throw error;

//     const tx=data??[];

//     const totalIncome=tx.filter((x:any)=>x.type==="income").reduce((s:number,x:any)=>s+x.amount,0);
//     const totalExpense=tx.filter((x:any)=>x.type==="expense").reduce((s:number,x:any)=>s+x.amount,0);

//     const expenseMap:Record<string,number>={};
//     const incomeMap:Record<string,number>={};
//     const trend:Record<string,number>={};

//     tx.forEach((t:any)=>{
//       const cat=t.categories?.name||"Khác";
//       if(t.type==="expense"){
//         expenseMap[cat]=(expenseMap[cat]||0)+t.amount;
//         trend[t.date]=(trend[t.date]||0)+t.amount;
//       }else{
//         incomeMap[cat]=(incomeMap[cat]||0)+t.amount;
//       }
//     });

//     const categorySummary=Object.entries(expenseMap)
//       .sort((a,b)=>b[1]-a[1])
//       .map(([k,v])=>`- ${k}: ${v.toLocaleString("vi-VN")} VNĐ (${totalExpense?((v/totalExpense)*100).toFixed(1):0}%)`)
//       .join("\n");

//     const incomeSummary=Object.entries(incomeMap)
//       .sort((a,b)=>b[1]-a[1])
//       .map(([k,v])=>`- ${k}: ${v.toLocaleString("vi-VN")} VNĐ`)
//       .join("\n");

//     const monthlyTrend=Object.entries(trend)
//       .sort((a,b)=>a[0].localeCompare(b[0]))
//       .map(([d,v])=>`${d}: ${v.toLocaleString("vi-VN")} VNĐ`)
//       .join("\n");

//     const largestExpense=tx.filter((t:any)=>t.type==="expense").sort((a:any,b:any)=>b.amount-a.amount)[0];

//     const prompt=`
// Phân tích tài chính bằng tiếng Việt.

// Thu nhập: ${totalIncome}
// Chi tiêu: ${totalExpense}
// Số dư: ${totalIncome-totalExpense}

// Chi tiêu theo danh mục:
// ${categorySummary}

// Thu nhập theo nguồn:
// ${incomeSummary}

// Xu hướng:
// ${monthlyTrend}

// Khoản chi lớn nhất:
// ${largestExpense?`${largestExpense.categories?.name}: ${largestExpense.amount}`:"Không có"}

// Hãy trả về Markdown với các mục:
// 1. Tổng quan
// 2. Thu nhập
// 3. Chi tiêu
// 4. Tiết kiệm
// 5. Điểm sức khỏe tài chính (0-100)
// 6. Điểm mạnh
// 7. Rủi ro
// 8. Khuyến nghị
// 9. Kết luận.
// `;

//     const openai=new OpenAI({
//       baseURL:"https://openrouter.ai/api/v1",
//       apiKey:Deno.env.get("AI_API_KEY")!,
//       defaultHeaders:{
//         "HTTP-Referer":Deno.env.get("APP_URL")||"",
//         "X-Title":Deno.env.get("APP_NAME")||"Finance Analyzer"
//       }
//     });

//     const completion=await openai.chat.completions.create({
//       model:"google/gemini-2.5-flash-lite",
//       messages:[
//         {role:"system",content:"Bạn là chuyên gia tài chính."},
//         {role:"user",content:prompt}
//       ]
//     });

//     return new Response(JSON.stringify({
//       summary:completion.choices[0].message.content,
//       totalIncome,
//       totalExpense,
//       transactionCount:tx.length,
//       usage:completion.usage
//     }),{
//       headers:{...corsHeaders,"Content-Type":"application/json"}
//     });

//   }catch(e:any){
//     return new Response(JSON.stringify({error:e.message}),{
//       status:500,
//       headers:{...corsHeaders,"Content-Type":"application/json"}
//     });
//   }
// });
