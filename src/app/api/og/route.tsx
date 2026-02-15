import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") || "Florence With Locals Forum";
  const category = searchParams.get("category") || "";
  const author = searchParams.get("author") || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          backgroundColor: "#FFF8E7",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            backgroundColor: "#C75B39",
          }}
        />

        {/* Category badge */}
        {category && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <div
              style={{
                backgroundColor: "#C75B39",
                color: "#fff",
                padding: "6px 16px",
                borderRadius: "20px",
                fontSize: "18px",
                fontWeight: 600,
              }}
            >
              {category}
            </div>
          </div>
        )}

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              fontSize: title.length > 60 ? "40px" : "52px",
              fontWeight: 700,
              color: "#5D4037",
              lineHeight: 1.2,
              margin: 0,
              maxHeight: "260px",
              overflow: "hidden",
            }}
          >
            {title}
          </h1>
          {author && (
            <p
              style={{
                fontSize: "22px",
                color: "#5D4037",
                opacity: 0.6,
                marginTop: "16px",
              }}
            >
              by @{author}
            </p>
          )}
        </div>

        {/* Footer branding */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                backgroundColor: "#C75B39",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              F
            </div>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: "#5D4037",
              }}
            >
              Florence With Locals Forum
            </span>
          </div>
          <span
            style={{
              fontSize: "16px",
              color: "#5D4037",
              opacity: 0.4,
            }}
          >
            forum.florencewithlocals.com
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
