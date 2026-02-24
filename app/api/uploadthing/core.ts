import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter cho app — định nghĩa các route upload
export const ourFileRouter = {
  // Route dành cho ảnh profile (tối đa 6 ảnh, mỗi ảnh tối đa 4MB)
  profileImage: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 6,
    },
  })
    .middleware(async () => {
      // Không yêu cầu auth để đơn giản hoá, có thể thêm sau
      return { uploadedAt: new Date().toISOString() };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload hoàn tất:", file.ufsUrl);
      return { url: file.ufsUrl };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
