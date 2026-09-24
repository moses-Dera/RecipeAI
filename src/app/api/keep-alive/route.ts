import { NextResponse } from "next/server";
import { FlagEmbedding, EmbeddingModel } from "fastembed";

// We keep a local reference so it stays in the serverless function's RAM
let embeddingModel: any = null;

export async function GET() {
  try {
    if (!embeddingModel) {
      console.log("Warming up AI Model...");
      embeddingModel = await FlagEmbedding.init({ model: EmbeddingModel.BGESmallEN });
    }
    return NextResponse.json({ status: "warm", message: "AI Model is loaded and ready!" });
  } catch (error) {
    console.error("Keep-alive error:", error);
    return NextResponse.json({ error: "Failed to warm up" }, { status: 500 });
  }
}
