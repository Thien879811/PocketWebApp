// /// <reference lib="deno.ns" />
// // @ts-ignore - Supabase Edge Functions support ESM imports via esm.sh at runtime
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2.42.0";
// // @ts-ignore - Supabase Edge Functions support ESM imports via esm.sh at runtime
// import ExcelJS from "https://esm.sh/exceljs@4.4.0?bundle";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
// };

// function jsonResponse(body: any, status = 200, extraHeaders: Record<string, string> = {}) {
//   return new Response(JSON.stringify(body), {
//     status,
//     headers: {
//       ...corsHeaders,
//       "Content-Type": "application/json",
//       ...extraHeaders,
//     },
//   });
// }

// // --- JWT signer (RS256) using WebCrypto (same approach as send-fcm) ---
// async function signJwt(payload: any, privateKeyPem: string) {
//   const pemHeader = "-----BEGIN PRIVATE KEY-----";
//   const pemFooter = "-----END PRIVATE KEY-----";
//   const pemContents = privateKeyPem.replace(pemHeader, "").replace(pemFooter, "").replace(/\s+/g, "");
//   const binaryDerString = atob(pemContents);
//   const binaryDer = new Uint8Array(binaryDerString.length);
//   for (let i = 0; i < binaryDerString.length; i++) {
//     binaryDer[i] = binaryDerString.charCodeAt(i);
//   }

//   const cryptoKey = await crypto.subtle.importKey(
//     "pkcs8",
//     binaryDer.buffer,
//     { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
//     false,
//     ["sign"]
//   );

//   const header = { alg: "RS256", typ: "JWT" };
//   const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
//   const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

//   const tokenData = `${encodedHeader}.${encodedPayload}`;
//   const signature = await crypto.subtle.sign(
//     "RSASSA-PKCS1-v1_5",
//     cryptoKey,
//     new TextEncoder().encode(tokenData)
//   );

//   const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
//     .replace(/=/g, "")
//     .replace(/\+/g, "-")
//     .replace(/\//g, "_");

//   return `${tokenData}.${encodedSignature}`;
// }

// async function getGoogleDriveAccessToken(serviceAccount: any) {
//   const now = Math.floor(Date.now() / 1000);
//   const jwtPayload = {
//     iss: serviceAccount.client_email,
//     scope: "https://www.googleapis.com/auth/drive.file",
//     aud: "https://oauth2.googleapis.com/token",
//     exp: now + 3600,
//     iat: now,
//   };

//   const jwt = await signJwt(jwtPayload, serviceAccount.private_key);

//   const response = await fetch("https://oauth2.googleapis.com/token", {
//     method: "POST",
//     headers: { "Content-Type": "application/x-www-form-urlencoded" },
//     body: new URLSearchParams({
//       grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
//       assertion: jwt,
//     }),
//   });

//   if (!response.ok) {
//     const errText = await response.text();
//     throw new Error(`Google access token exchange failed: ${response.statusText} - ${errText}`);
//   }

//   const data = await response.json();
//   return data.access_token as string;
// }

// function formatDriveFileName(base: string) {
//   const d = new Date();
//   const pad = (n: number) => String(n).padStart(2, "0");
//   const yyyy = d.getFullYear();
//   const mm = pad(d.getMonth() + 1);
//   const dd = pad(d.getDate());
//   const hh = pad(d.getHours());
//   const min = pad(d.getMinutes());
//   return `${base}_${yyyy}-${mm}-${dd}_${hh}${min}`;
// }

// Deno.serve(async (req) => {
//   if (req.method === "OPTIONS") {
//     return new Response("ok", { headers: corsHeaders });
//   }

//   try {
//     const { driveFolderId, fileNameBase, transactions } = await req.json().catch(() => ({}));

//     if (!Array.isArray(transactions)) {
//       return jsonResponse({ error: "Missing or invalid 'transactions' array in request body." }, 400);
//     }

//     const serviceAccountRaw = Deno.env.get("GOOGLE_SERVICE_ACCOUNT");
//     if (!serviceAccountRaw) {
//       return jsonResponse({ error: "Missing env GOOGLE_SERVICE_ACCOUNT (service account JSON)." }, 500);
//     }
//     const serviceAccount = JSON.parse(serviceAccountRaw);

//     const driveAccessToken = await getGoogleDriveAccessToken(serviceAccount);

//     // ---- Build Excel (ledger.xlsx) in edge function ----
//     // Keep columns aligned with exportTransactionsToExcel.ts
//     const workbook = new ExcelJS.Workbook();
//     workbook.creator = "PocketWebApp";
//     workbook.created = new Date();

//     const worksheet = workbook.addWorksheet("Ledger", {
//       views: [{ state: "frozen", ySplit: 1 }],
//     });

//     const headers = [
//       "Date",
//       "Type",
//       "Amount",
//       "Category ID",
//       "Goal ID",
//       "Account ID",
//       "Note",
//       "Receipt URL",
//       "Fee",
//       "Due Date",
//       "Person Name",
//     ];
//     worksheet.addRow(headers);

//     const headerRow = worksheet.getRow(1);
//     headerRow.font = { bold: true };
//     headerRow.alignment = { vertical: "middle", horizontal: "center" };

//     worksheet.autoFilter = {
//       from: { row: 1, column: 1 },
//       to: { row: 1, column: headers.length },
//     };

//     const colWidths = [12, 12, 12, 14, 10, 12, 20, 20, 10, 12, 16];
//     worksheet.columns = colWidths.map((w) => ({ width: w }));

//     for (const tx of transactions) {
//       const typeLabel = (tx?.type ?? "").toString();
//       worksheet.addRow([
//         tx?.date ?? "",
//         typeLabel,
//         typeof tx?.amount === "number" ? tx.amount : Number(tx?.amount ?? 0),
//         tx?.category_id ?? "",
//         tx?.goal_id ?? "",
//         tx?.account_id ?? "",
//         tx?.note ?? "",
//         tx?.receipt_url ?? "",
//         typeof tx?.fee === "number" ? tx.fee : Number(tx?.fee ?? 0),
//         tx?.due_date ?? "",
//         tx?.person_name ?? "",
//       ]);
//     }

//     for (let rowIndex = 2; rowIndex <= worksheet.rowCount; rowIndex++) {
//       const amountCell = worksheet.getRow(rowIndex).getCell(3);
//       amountCell.numFmt = "0.00";
//       const feeCell = worksheet.getRow(rowIndex).getCell(9);
//       feeCell.numFmt = "0.00";
//     }

//     const xlsxBuffer = await workbook.xlsx.writeBuffer();

//     const googleFileName = formatDriveFileName(fileNameBase || "ledger.xlsx");

//     // ---- Upload to Google Drive ----
//     // Use multipart upload with metadata + media
//     const folderIdToUse = driveFolderId || Deno.env.get("GOOGLE_DRIVE_FOLDER_ID") || "";

//     const metadata: any = {
//       name: googleFileName,
//       mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//     };

//     if (folderIdToUse) {
//       metadata.parents = [folderIdToUse];
//     }

//     const boundary = `==pocketflow_boundary_${Math.random().toString(16).slice(2)}==`;
//     const delimiter = `\r\n--${boundary}\r\n`;
//     const closeDelimiter = `\r\n--${boundary}--`;

//     const multipartRequestBody =
//       `${delimiter}` +
//       `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
//       `${JSON.stringify(metadata)}` +
//       `${delimiter}` +
//       `Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet\r\n\r\n`;

//     const multipartBody = new Uint8Array(
//       multipartRequestBody.length + xlsxBuffer.byteLength + closeDelimiter.length
//     );

//     // concat string header + bytes + close string
//     let offset = 0;
//     for (let i = 0; i < multipartRequestBody.length; i++) multipartBody[offset++] = multipartRequestBody.charCodeAt(i);
//     const arr = new Uint8Array(xlsxBuffer);
//     multipartBody.set(arr, offset);
//     offset += arr.length;
//     for (let i = 0; i < closeDelimiter.length; i++) multipartBody[offset++] = closeDelimiter.charCodeAt(i);

//     const uploadRes = await fetch(
//       "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${driveAccessToken}`,
//           "Content-Type": `multipart/related; boundary=${boundary}`,
//           "Content-Length": String(multipartBody.byteLength),
//         },
//         body: multipartBody,
//       }
//     );

//     if (!uploadRes.ok) {
//       const errText = await uploadRes.text();
//       return jsonResponse({ error: `Google Drive upload failed: ${uploadRes.statusText}`, details: errText }, 500);
//     }

//     const uploaded = await uploadRes.json();

//     // Return both IDs and useful link
//     return jsonResponse({
//       success: true,
//       file: {
//         id: uploaded.id,
//         name: uploaded.name,
//         webViewLink: uploaded.webViewLink,
//         webContentLink: uploaded.webContentLink,
//       },
//     }, 200);
//   } catch (err: any) {
//     console.error("upload-to-drive error:", err);
//     return jsonResponse({ error: err?.message || String(err) }, 500);
//   }
// });
