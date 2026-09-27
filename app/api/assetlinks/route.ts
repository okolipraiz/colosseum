export const dynamic = "force-static";

const ASSET_LINKS = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "com.phaceex.forcastapp",
      sha256_cert_fingerprints: [
        "EE:C0:56:D5:69:AE:13:22:AC:42:54:3A:41:19:9E:F9:B6:CC:AA:B8:F4:E1:78:D6:B5:3B:FE:3B:F3:4A:C1:2E",
        "FA:87:6C:A2:44:A9:2A:28:37:2E:E0:49:55:E5:CE:B2:AF:08:15:92:7B:80:57:18:0D:75:9C:8E:C8:A2:E8:D3",
      ],
    },
  },
];

export function GET() {
  return Response.json(ASSET_LINKS, {
    headers: { "Cache-Control": "public, max-age=3600" },
  });
}
