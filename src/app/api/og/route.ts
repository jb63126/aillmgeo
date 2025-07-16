import { ImageResponse } from "next/og";
import { RenderIMGEl } from "~/components/OGImgEl";
import { siteUrl } from "~/config/site";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hasLocale = searchParams.has("locale");
  const locale = hasLocale ? searchParams.get("locale") : "";

  try {
    return new ImageResponse(
      RenderIMGEl({
        logo: "", // No longer using logo file
        locale: locale as string,
        image: "", // No longer using image file
      }),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    console.log(e);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
