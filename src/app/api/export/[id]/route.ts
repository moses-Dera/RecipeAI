import { exportController } from "@/lib/modules/export/export.controller";
export const GET = exportController.downloadRecipe.bind(exportController);
