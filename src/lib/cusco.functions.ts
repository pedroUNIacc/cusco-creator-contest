import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const complementSchema = z.enum(["batata", "milho", "ervilha", "queijo", "cebola", "bacon", "catupiry", "molho"]);

const orderItemSchema = z.object({
  breedId: z.enum(["caramelo", "golden", "fox", "doberman", "rottweiler"]),
  complements: z.array(complementSchema).max(5),
  drink: z.boolean(),
  subtotal: z.number().int().min(0).max(100),
});

export const createSecureOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        customerName: z.string().trim().min(1).max(100),
        items: z.array(orderItemSchema).min(1).max(20),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await (supabaseAdmin as any)
      .rpc("create_order", {
        _user_id: context.userId,
        _customer_name: data.customerName,
        _items: data.items,
      })
      .single();

    if (error) throw new Error("Não foi possível salvar o pedido.");
    return { id: order.id as string, code: order.code as string, total: Number(order.total) };
  });

export const redeemSecureReward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        rewardId: z.string().regex(/^[a-z0-9_-]{1,40}$/),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: redemption, error } = await (supabaseAdmin as any)
      .rpc("redeem_reward", {
        _user_id: context.userId,
        _reward_id: data.rewardId,
      })
      .single();

    if (error) throw new Error("Não foi possível resgatar a recompensa.");
    return { code: redemption.code as string, remaining: Number(redemption.remaining) };
  });