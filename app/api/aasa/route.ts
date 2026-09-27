export const dynamic = "force-static";

const AASA = {
  applinks: {
    apps: [],
    details: [
      {
        appIDs: ["RN4VN4G9N6.com.phaceex.forcastapp"],
        components: [
          { "/": "/markets/*", comment: "Matches market detail screens" },
          { "/": "/share/*", comment: "Matches share screens" },
        ],
      },
    ],
  },
  webcredentials: {
    apps: ["RN4VN4G9N6.com.phaceex.forcastapp"],
  },
};

export function GET() {
  return Response.json(AASA, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
