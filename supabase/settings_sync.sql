ALTER TABLE public.user_settings
  ADD COLUMN IF NOT EXISTS color_theme VARCHAR(50) DEFAULT 'Lila',
  ADD COLUMN IF NOT EXISTS tree_type VARCHAR(50) DEFAULT 'oak';

UPDATE public.user_settings
SET color_theme = COALESCE(NULLIF(color_theme, ''), 'Lila'),
    tree_type = COALESCE(NULLIF(tree_type, ''), 'oak')
WHERE color_theme IS NULL OR color_theme = '' OR tree_type IS NULL OR tree_type = '';

NOTIFY pgrst, 'reload schema';
