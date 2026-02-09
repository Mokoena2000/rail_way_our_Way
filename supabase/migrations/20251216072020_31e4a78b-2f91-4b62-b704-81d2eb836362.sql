-- Create lines table
CREATE TABLE public.lines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  color_code TEXT NOT NULL DEFAULT '#FFD700',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create stations table
CREATE TABLE public.stations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  line_id UUID REFERENCES public.lines(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trips table
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  line_id UUID REFERENCES public.lines(id) ON DELETE CASCADE NOT NULL,
  departure_time TIME NOT NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('on_time', 'delayed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables (crowdsourced app - everyone can see data)
CREATE POLICY "Anyone can view lines" ON public.lines FOR SELECT USING (true);
CREATE POLICY "Anyone can view stations" ON public.stations FOR SELECT USING (true);
CREATE POLICY "Anyone can view trips" ON public.trips FOR SELECT USING (true);
CREATE POLICY "Anyone can view reports" ON public.reports FOR SELECT USING (true);

-- Anyone can submit reports (crowdsourced - no auth required for MVP)
CREATE POLICY "Anyone can submit reports" ON public.reports FOR INSERT WITH CHECK (true);

-- Enable realtime for reports table
ALTER PUBLICATION supabase_realtime ADD TABLE public.reports;