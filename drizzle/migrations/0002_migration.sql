
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.bookings_before_insert() from public, anon, authenticated;
revoke execute on function public.bookings_before_update() from public, anon, authenticated;
revoke execute on function public.bookings_after_change() from public, anon, authenticated;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
