import { fetchClient, ApiResponse } from "@/lib/api-client";

export interface Shortcut {
  id: number;
  shortcutKey: string;
  productId: number;
  productName: string;
  productSku: string | null;
}

export class ShortcutService {
  static async getAllShortcuts(): Promise<Shortcut[]> {
    const response = await fetchClient<ApiResponse<Shortcut[]>>("/shortcuts");
    return response.data || [];
  }

  static async createShortcut(shortcutKey: string, productId: number): Promise<Shortcut> {
    const response = await fetchClient<{ success: boolean; data: Shortcut }>("/shortcuts", {
      method: "POST",
      data: { shortcutKey, productId },
    });
    return response.data;
  }

  static async deleteShortcut(id: number): Promise<void> {
    await fetchClient(`/shortcuts/${id}`, {
      method: "DELETE",
    });
  }
}
