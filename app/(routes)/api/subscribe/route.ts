import Kv from "../../../lib/storage/kv";
import { NextRequest, NextResponse } from "next/server";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(request: NextRequest) {
  const subscriptionPostData = await request.json();
  // insert into kv store. key is push_ + subscriptionPostData.userId

  const key = `push_subscriptions_1_${subscriptionPostData.userId}`;

  // delete the key first
  // await Kv.GetInstance().HDel(key, "subscription");

  await Kv.GetInstance().HGetOrSet(key, "subscription", async () => {
    return {
      subscription: {
        userId: subscriptionPostData.userId,
        browserSubscription: subscriptionPostData.subscription,
      },
    };
  });

  return new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
}
