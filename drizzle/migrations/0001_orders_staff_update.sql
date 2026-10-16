GRANT UPDATE (status, payment_status, tracking_number, internal_note, cancel_reason) ON public.orders TO authenticated;
CREATE POLICY "order staff update" ON public.orders FOR UPDATE TO authenticated USING (public.can_manage_orders(auth.uid())) WITH CHECK (public.can_manage_orders(auth.uid()));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products, public.product_variants, public.product_media, public.product_categories TO authenticated;
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_first_owner() TO authenticated;
GRANT EXECUTE ON FUNCTION public.owner_exists() TO authenticated;