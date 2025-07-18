import chromium from '@sparticuz/chromium';
import puppeteer from 'puppeteer-core';
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { env } from "~/env";
import { z } from "zod";
import fs from "fs";

export const invoiceRouter = createTRPCRouter({
  createInvoice: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      console.log(process.env.PUPPETEER_EXECUTABLE_PATH);
      const browser = await puppeteer.launch({
        // executablePath: process.env.PUPPETEER_EXECUTABLE_PATH ?? undefined,
        // headless: true,
        // args: ["--no-sandbox", "--disable-setuid-sandbox"],
  executablePath: await chromium.executablePath(),
  headless: chromium.headless,
  args: chromium.args,
      });
      const page = await browser.newPage();
      await page.goto(`${env.NEXTAUTH_URL}/invoice/${input}`, {
        waitUntil: "networkidle2",
      });

      await page.waitForSelector(".itemClass");

      const filePath = `/tmp/invoice-${input}.pdf`;
      const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });

      await browser.close();
      fs.writeFileSync(filePath, pdfBuffer);

      return `/api/invoiceDownload?file=${encodeURIComponent(filePath)}`;
    }),
});
