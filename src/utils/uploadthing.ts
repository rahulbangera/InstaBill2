import {
  generateUploadButton,
  generateUploadDropzone,
} from "@uploadthing/react";
import { utapi } from "~/server/uploadthing";
import { z } from "zod";

import type { OurFileRouter } from "~/app/api/uploadthing/core";

type UploadDeleteResponse =
  | { success: true; message: string }
  | { success: false; error: string };

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();
