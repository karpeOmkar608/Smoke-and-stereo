-- Never seed invented products, customer records, credentials, or admin roles.
insert into public.site_settings(setting_key,setting_value) values ('content','{"announcement":"INDEPENDENT CULTURE. UNCOMPROMISED EXPRESSION.","heroTitle":"BUILT FROM CULTURE.","heroCopy":"Desi Hip-Hop. Street culture. A different frequency."}') on conflict(setting_key) do nothing;
