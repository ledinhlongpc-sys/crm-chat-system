import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST() {
  try {

    /* ================= CONFIG ================= */

    const customerCode = "084LC02438";
    const password = "526D6B02F7EE8E48B620EE8E5BD7F429";
    const privateKey = "4AE2DBF6527EA7C49C59EFF24F6FEA71";

    /* ================= DATA TEST ================= */

    const bizContentObj = {
      customerCode,
      txlogisticId: "TEST" + Date.now()
    };

    const bizContent = JSON.stringify(bizContentObj);

    /* ================= DIGEST ================= */

    const md5 = crypto
      .createHash("md5")
      .update(bizContent + privateKey)
      .digest();

    const digest = Buffer.from(md5).toString("base64");

    /* ================= BODY ================= */

    const body = new URLSearchParams({
      customerCode,
      password,
      bizContent
    });

    const requestBody = body.toString();

    console.log("===== JT REQUEST =====");
    console.log("customerCode:", customerCode);
    console.log("password:", password);
    console.log("privateKey:", privateKey);
    console.log("bizContent:", bizContent);
    console.log("digest:", digest);
    console.log("body:", requestBody);

    /* ================= CALL JT ================= */

    const res = await fetch(
      "https://test-openapi.jtexpress.vn/webopenplatformapi/api/order/createOrder",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          digest
        },
        body: requestBody
      }
    );

    const text = await res.text();

    console.log("===== JT RESPONSE =====");
    console.log("status:", res.status);
    console.log("response:", text);

    /* ================= RETURN ================= */

    return NextResponse.json({
      success: true,

      request: {
        customerCode,
        password,
        privateKey,
        bizContent,
        digest,
        body: requestBody
      },

      jt_response: {
        status: res.status,
        raw: text
      }

    });

  } catch (err: any) {

    console.error("===== JT ERROR =====");
    console.error(err);

    return NextResponse.json(
      {
        success: false,
        error: err.message,
        stack: err.stack
      },
      { status: 500 }
    );
  }
}