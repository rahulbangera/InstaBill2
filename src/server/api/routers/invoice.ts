import puppeteer from 'puppeteer';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { env } from '~/env';
import { z } from 'zod';

export const invoiceRouter = createTRPCRouter({
    createInvoice: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            const browser = await puppeteer.launch({headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox']});
            const page = await browser.newPage();
            await page.goto(`${env.NEXTAUTH_URL}/invoice/${input}`, {waitUntil: 'networkidle2'});

            const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
      
            await browser.close();
      
            return Buffer.from(pdfBuffer).toString("base64");
        }),
});
