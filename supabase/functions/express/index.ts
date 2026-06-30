// import "jsr:@supabase/functions-js/edge-runtime.d.ts";
// import OpenAI from "npm:openai";
// import { createClient } from "npm:@supabase/supabase-js";

// // ✅ CORS Headers
// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
//   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
// };

// Deno.serve(async (req: Request): Promise<Response> => {
//   // Handle CORS preflight
//   if (req.method === "OPTIONS") {
//     return new Response("ok", { headers: corsHeaders });
//   }

//   try {
//     const url = new URL(req.url);
//     const path = url.pathname;

//     // Health check
//     if (path.endsWith("/test") || path.endsWith("/express")) {
//       return new Response(
//         JSON.stringify({ message: "Hello", status: "ok" }),
//         { headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     // Monthly financial analysis
//     if (path.includes("/analysis/monthly")) {
//       const supabase = createClient(
//         Deno.env.get("SUPABASE_URL")!,
//         Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
//       );

//       // Helper to safely format Date to YYYY-MM-DD without UTC timezone shifts
//       const formatDate = (date: Date) => {
//         const year = date.getFullYear();
//         const month = String(date.getMonth() + 1).padStart(2, '0');
//         const day = String(date.getDate()).padStart(2, '0');
//         return `${year}-${month}-${day}`;
//       };

//       const now = new Date();
//       const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//       const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

//       const { data, error } = await supabase
//         .from("transactions")
//         .select("*")
//         .gte("date", formatDate(startOfMonth))
//         .lt("date", formatDate(startOfNextMonth));

//       if (error) {
//         return new Response(
//           JSON.stringify({ error: error.message }),
//           { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }

//       if (!data || data.length === 0) {
//         return new Response(
//           JSON.stringify({
//             summary: "Không có giao dịch nào trong tháng này.",
//             totalIncome: 0,
//             totalExpense: 0,
//             transactionCount: 0
//           }),
//           { headers: { ...corsHeaders, "Content-Type": "application/json" } }
//         );
//       }

//       const totalIncome = data
//         .filter((x: any) => x.type === "income")
//         .reduce((sum: number, x: any) => sum + x.amount, 0);

//       const totalExpense = data
//         .filter((x: any) => x.type === "expense")
//         .reduce((sum: number, x: any) => sum + x.amount, 0);

//       const savingsRate = totalIncome > 0
//         ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
//         : 0;

//       const prompt = `
// Analyze the following personal finance data and generate a comprehensive financial analysis in **Vietnamese**.

// ## Financial Summary

// * Total Income: ${totalIncome}
// * Total Expense: ${totalExpense}
// * Net Balance: ${totalIncome - totalExpense}
// * Savings: ${Math.max(totalIncome - totalExpense, 0)}
// * Savings Rate: ${savingsRate}%
// * Number of Transactions: ${data.length}

// ## Expense Breakdown by Category

// ${categorySummary}

// ## Income Breakdown by Source

// ${incomeSummary}

// ## Monthly Trend

// ${monthlyTrend}

// ## Additional Information

// ${additionalContext}

// ### Instructions

// You are a professional personal financial advisor.

// Analyze the user's financial situation objectively based on the provided data only. Do not invent information.

// Return the result in **Vietnamese** using Markdown.

// Include the following sections:

// # 1. Tổng quan tài chính cá nhân

// * Tóm tắt tình hình thu nhập, chi tiêu và số dư.
// * Đánh giá tháng này là tích cực, ổn định hay đáng lo ngại.
// * Nhận xét xu hướng tài chính chung.

// # 2. Phân tích thu nhập

// * Đánh giá mức thu nhập.
// * Nguồn thu nhập chính.
// * Thu nhập có ổn định hay không.
// * Nếu có nhiều nguồn thu, đánh giá mức độ đa dạng.

// # 3. Phân tích chi tiêu

// * Các nhóm chi tiêu lớn nhất.
// * Tỷ trọng từng nhóm.
// * Chi tiêu nào là cần thiết.
// * Chi tiêu nào có thể tối ưu.
// * Phát hiện các khoản chi bất thường nếu có.

// # 4. Phân tích tiết kiệm

// * Đánh giá tỷ lệ tiết kiệm.
// * So sánh với mức khuyến nghị:

//   * <10%: Thấp
//   * 10–20%: Trung bình
//   * 20–30%: Tốt
//   * > 30%: Rất tốt
// * Nhận xét khả năng tích lũy.

// # 5. Đánh giá sức khỏe tài chính

// Cho điểm từ **0 đến 100** dựa trên:

// * Thu nhập
// * Chi tiêu
// * Tỷ lệ tiết kiệm
// * Số dư cuối kỳ
// * Tính ổn định tài chính

// Giải thích lý do của số điểm.

// # 6. Điểm mạnh

// Liệt kê 3–5 điểm mạnh trong tình hình tài chính hiện tại.

// # 7. Rủi ro tài chính

// Phân tích các rủi ro như:

// * Chi tiêu vượt thu nhập
// * Chi tiêu quá nhiều cho một danh mục
// * Tiết kiệm thấp
// * Phụ thuộc vào một nguồn thu nhập
// * Biến động thu nhập
// * Thiếu quỹ dự phòng

// # 8. Khuyến nghị cải thiện

// Đưa ra các khuyến nghị cụ thể và thực tế như:

// * Giảm các khoản chi nào
// * Tăng tiết kiệm
// * Phân bổ ngân sách hợp lý
// * Xây dựng quỹ khẩn cấp
// * Đầu tư nếu phù hợp
// * Mục tiêu tài chính cho tháng tới

// # 9. Kết luận

// Viết một đoạn kết ngắn (2–4 câu) tổng kết tình hình tài chính và động viên người dùng tiếp tục quản lý tài chính hiệu quả.

// ### Writing Style

// * Chuyên nghiệp nhưng thân thiện.
// * Dễ hiểu với người không có kiến thức tài chính.
// * Không sử dụng emoji.
// * Không lặp lại số liệu quá nhiều.
// * Đưa ra nhận xét có giá trị thay vì chỉ mô tả dữ liệu.

// `;

//       // ✅ Khởi tạo OpenAI SDK nhưng trỏ sang OpenRouter
//       const openai = new OpenAI({
//         baseURL: "https://openrouter.ai/api/v1",
//         apiKey: Deno.env.get("AI_API_KEY")!,
//         defaultHeaders: {
//           // Các header theo yêu cầu của OpenRouter (để họ biết app nào đang gọi)
//           "HTTP-Referer": Deno.env.get("APP_URL") || "https://your-app.com",
//           "X-Title": Deno.env.get("APP_NAME") || "Finance Analyzer",
//         },
//       });

//       const completion = await openai.chat.completions.create({
//         model: "openrouter/free", // Model miễn phí của OpenRouter
//         // Hoặc dùng các model khác như:
//         // "anthropic/claude-3.5-sonnet"
//         // "openai/gpt-4o-mini"
//         // "google/gemini-2.0-flash-exp:free"
//         // "meta-llama/llama-3.3-70b-instruct:free"
//         messages: [
//           {
//             role: "system",
//             content: "You are a senior financial analyst. Respond in Vietnamese."
//           },
//           {
//             role: "user",
//             content: prompt
//           }
//         ]
//       });

//       const analysis = completion.choices[0]?.message?.content || "Không thể tạo phân tích.";

//       return new Response(
//         JSON.stringify({
//           summary: analysis,
//           totalIncome,
//           totalExpense,
//           transactionCount: data.length,
//           // Thông tin usage từ OpenRouter (nếu có)
//           usage: completion.usage
//         }),
//         { headers: { ...corsHeaders, "Content-Type": "application/json" } }
//       );
//     }

//     // Default: 404
//     return new Response(
//       JSON.stringify({ error: "Not found" }),
//       { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//     );

//   } catch (err: any) {
//     console.error("Function error:", err);
//     return new Response(
//       JSON.stringify({ error: err.message || "Internal server error" }),
//       { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
//     );
//   }
// });