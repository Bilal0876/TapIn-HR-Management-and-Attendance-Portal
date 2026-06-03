import { z } from 'zod';

export const DownloadReportSchema = z.object({
  year: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
  month: z.string().regex(/^(0?[1-9]|1[0-2])$/, 'Month must be between 1 and 12'),
});

export type DownloadReportInput = z.infer<typeof DownloadReportSchema>;
