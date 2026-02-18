import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import FeatureGate from '@/components/auth/FeatureGate';
import { locationAnalysisService } from '@/services/locationAnalysis';
import { competitorsService } from '@/services/competitors';
import { expansionScenariosService } from '@/services/expansionScenarios';
import type { CompetitorData, ExpansionScenarioData } from '@/services/locationDemoData';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MapPin,
  Users,
  TrendingUp,
  BarChart3,
  Target,
  Building2,
  Loader2,
  Map,
  Activity,
  DollarSign,
  Plus,
} from 'lucide-react';

import ZurichCatchmentMap from '@/components/location/ZurichCatchmentMap';
import MemberDistributionChart from '@/components/location/MemberDistributionChart';
import DistanceDistributionChart from '@/components/location/DistanceDistributionChart';
import GrowthPotentialChart from '@/components/location/GrowthPotentialChart';
import SeasonalPatternsChart from '@/components/location/SeasonalPatternsChart';
import UtilizationHeatmap from '@/components/location/UtilizationHeatmap';
import CompetitorTable from '@/components/location/CompetitorTable';
import CompetitorDialog from '@/components/location/CompetitorDialog';
import MarketShareChart from '@/components/location/MarketShareChart';
import PricingPositionChart from '@/components/location/PricingPositionChart';
import ExpansionScenarioCard from '@/components/location/ExpansionScenarioCard';
import NewScenarioDialog from '@/components/location/NewScenarioDialog';
import ROICalculator from '@/components/location/ROICalculator';

const LocationAnalysis = () => {
  const { gym } = useAuth();
  const queryClient = useQueryClient();

  // Dialog state
  const [competitorDialogOpen, setCompetitorDialogOpen] = useState(false);
  const [editingCompetitor, setEditingCompetitor] = useState<CompetitorData | undefined>();
  const [scenarioDialogOpen, setScenarioDialogOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<ExpansionScenarioData | undefined>();

  // Data queries
  const { data: overview, isLoading: overviewLoading } = useQuery({
    queryKey: ['location-overview', gym?.id],
    queryFn: () => locationAnalysisService.getOverview(gym!.id),
    enabled: !!gym?.id,
  });

  const { data: plzData = [], isLoading: plzLoading } = useQuery({
    queryKey: ['location-plz', gym?.id],
    queryFn: () => locationAnalysisService.getPLZData(gym!.id),
    enabled: !!gym?.id,
  });

  const { data: heatmapData = [] } = useQuery({
    queryKey: ['location-heatmap', gym?.id],
    queryFn: () => locationAnalysisService.getUtilizationHeatmap(gym!.id),
    enabled: !!gym?.id,
  });

  const { data: seasonalData = [] } = useQuery({
    queryKey: ['location-seasonal', gym?.id],
    queryFn: () => locationAnalysisService.getSeasonalPatterns(gym!.id),
    enabled: !!gym?.id,
  });

  const { data: distanceData = [] } = useQuery({
    queryKey: ['location-distance', gym?.id],
    queryFn: () => locationAnalysisService.getDistanceDistribution(gym!.id),
    enabled: !!gym?.id,
  });

  const { data: competitors = [] } = useQuery({
    queryKey: ['competitors', gym?.id],
    queryFn: () => competitorsService.getAll(gym!.id),
    enabled: !!gym?.id,
  });

  const { data: expansionScenarios = [] } = useQuery({
    queryKey: ['expansion-scenarios', gym?.id],
    queryFn: () => expansionScenariosService.getAll(gym!.id),
    enabled: !!gym?.id,
  });

  // Competitor mutations
  const createCompetitor = useMutation({
    mutationFn: (data: Omit<CompetitorData, 'id'>) =>
      competitorsService.create({ ...data, gym_id: gym!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
      toast.success('Competitor added');
    },
    onError: () => toast.error('Failed to add competitor'),
  });

  const updateCompetitor = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CompetitorData> }) =>
      competitorsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
      toast.success('Competitor updated');
    },
    onError: () => toast.error('Failed to update competitor'),
  });

  const deleteCompetitor = useMutation({
    mutationFn: (id: string) => competitorsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['competitors'] });
      toast.success('Competitor removed');
    },
    onError: () => toast.error('Failed to delete competitor'),
  });

  // Expansion scenario mutations
  const createScenario = useMutation({
    mutationFn: (data: Omit<ExpansionScenarioData, 'id'>) =>
      expansionScenariosService.create({ ...data, gym_id: gym!.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expansion-scenarios'] });
      toast.success('Scenario created');
    },
    onError: () => toast.error('Failed to create scenario'),
  });

  const updateScenario = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ExpansionScenarioData> }) =>
      expansionScenariosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expansion-scenarios'] });
      toast.success('Scenario updated');
    },
    onError: () => toast.error('Failed to update scenario'),
  });

  const deleteScenario = useMutation({
    mutationFn: (id: string) => expansionScenariosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expansion-scenarios'] });
      toast.success('Scenario deleted');
    },
    onError: () => toast.error('Failed to delete scenario'),
  });

  // Handlers
  const handleAddCompetitor = () => {
    setEditingCompetitor(undefined);
    setCompetitorDialogOpen(true);
  };

  const handleEditCompetitor = (comp: CompetitorData) => {
    setEditingCompetitor(comp);
    setCompetitorDialogOpen(true);
  };

  const handleSaveCompetitor = (data: Omit<CompetitorData, 'id'>) => {
    if (editingCompetitor) {
      updateCompetitor.mutate({ id: editingCompetitor.id, data });
    } else {
      createCompetitor.mutate(data);
    }
  };

  const handleAddScenario = () => {
    setEditingScenario(undefined);
    setScenarioDialogOpen(true);
  };

  const handleEditScenario = (scenario: ExpansionScenarioData) => {
    setEditingScenario(scenario);
    setScenarioDialogOpen(true);
  };

  const handleSaveScenario = (data: Omit<ExpansionScenarioData, 'id'>) => {
    if (editingScenario) {
      updateScenario.mutate({ id: editingScenario.id, data });
    } else {
      createScenario.mutate(data);
    }
  };

  if (!gym) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isLoading = overviewLoading || plzLoading;

  return (
    <FeatureGate feature="locationAnalysis">
      <div className="space-y-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Location Analysis</h1>
          <p className="text-muted-foreground">
            Location intelligence and market insights
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="backdrop-blur-md bg-card/80 flex-wrap h-auto">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="geography">Geography</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="competition">Competition</TabsTrigger>
              <TabsTrigger value="expansion">Expansion</TabsTrigger>
            </TabsList>

            {/* ================================================================
                OVERVIEW TAB
                ================================================================ */}
            <TabsContent value="overview" className="space-y-6">
              {/* KPI Cards */}
              {overview && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Current Members
                        </span>
                      </div>
                      <p className="text-2xl font-bold">
                        {overview.currentMembers}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Market Penetration
                        </span>
                      </div>
                      <p className="text-2xl font-bold">
                        {(overview.marketPenetration * 100).toFixed(1)}%
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Revenue / sqm
                        </span>
                      </div>
                      <p className="text-2xl font-bold">
                        CHF {overview.avgRevenuePerSqm.toFixed(1)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Catchment Radius
                        </span>
                      </div>
                      <p className="text-2xl font-bold">
                        {overview.catchmentRadiusKm} km
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Map + Top PLZ */}
              <div className="grid lg:grid-cols-3 gap-6">
                <Card className="glass-card lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Map className="h-5 w-5 text-primary" />
                      Member Catchment Map
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ZurichCatchmentMap plzData={plzData} />
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Top PLZ Areas
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[...plzData]
                        .sort((a, b) => b.members - a.members)
                        .slice(0, 8)
                        .map((p) => (
                          <div
                            key={p.plz}
                            className="flex items-center justify-between p-2 rounded bg-muted/50"
                          >
                            <div>
                              <span className="text-sm font-medium">
                                {p.plz} {p.name}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {p.distanceKm} km away
                              </p>
                            </div>
                            <div className="text-right">
                              <span className="text-sm font-semibold">
                                {p.members}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {(p.penetration * 100).toFixed(2)}%
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ================================================================
                GEOGRAPHY TAB
                ================================================================ */}
            <TabsContent value="geography" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* PLZ bar chart */}
                <Card className="glass-card lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      Members by Postal Code (Top 15)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MemberDistributionChart plzData={plzData} />
                  </CardContent>
                </Card>

                {/* Distance donut */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Distance Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DistanceDistributionChart data={distanceData} />
                  </CardContent>
                </Card>

                {/* Detail table */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      PLZ Detail
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto max-h-[340px] overflow-y-auto rounded-lg border border-border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>PLZ</TableHead>
                            <TableHead>Area</TableHead>
                            <TableHead className="text-right">Members</TableHead>
                            <TableHead className="text-right">Pop.</TableHead>
                            <TableHead className="text-right">Penetration</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[...plzData]
                            .sort((a, b) => b.members - a.members)
                            .filter(p => p.members > 0)
                            .map((p) => (
                              <TableRow key={p.plz}>
                                <TableCell className="font-medium">
                                  {p.plz}
                                </TableCell>
                                <TableCell className="text-muted-foreground">
                                  {p.name}
                                </TableCell>
                                <TableCell className="text-right">
                                  {p.members}
                                </TableCell>
                                <TableCell className="text-right text-muted-foreground">
                                  {p.population.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  {(p.penetration * 100).toFixed(3)}%
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ================================================================
                MARKET TAB
                ================================================================ */}
            <TabsContent value="market" className="space-y-6">
              {/* Market stats */}
              {overview && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Total Market Size
                        </span>
                      </div>
                      <p className="text-2xl font-bold">
                        {overview.totalMarketSize.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        residents in catchment
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Est. Gym Members
                        </span>
                      </div>
                      <p className="text-2xl font-bold">
                        {overview.estimatedTotalGymMembers.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        total across all gyms
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Target className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Your Market Share
                        </span>
                      </div>
                      <p className="text-2xl font-bold">
                        {(overview.gymMarketShare * 100).toFixed(2)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        of local gym market
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Gym Area
                        </span>
                      </div>
                      <p className="text-2xl font-bold">
                        {overview.gymAreaSqm} sqm
                      </p>
                      <p className="text-xs text-muted-foreground">
                        facility size
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Growth potential chart */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Growth Potential by PLZ
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <GrowthPotentialChart plzData={plzData} />
                  <div className="flex items-center gap-4 mt-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(142, 76%, 36%)' }} />
                      <span className="text-muted-foreground">High potential</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(38, 92%, 50%)' }} />
                      <span className="text-muted-foreground">Medium potential</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(215, 16%, 47%)' }} />
                      <span className="text-muted-foreground">Low potential</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* High-potential areas */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>High Growth Potential Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {plzData
                      .filter(p => p.growthPotential === 'high')
                      .sort((a, b) => b.population - a.population)
                      .map(p => (
                        <div
                          key={p.plz}
                          className="p-4 rounded-lg bg-green-500/10 border border-green-500/20"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold">{p.plz} {p.name}</span>
                            <Badge className="bg-green-500 text-white">High</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Population: {p.population.toLocaleString()}</p>
                            <p>Current members: {p.members}</p>
                            <p>Avg income: CHF {p.avgIncome.toLocaleString()}</p>
                            <p>Distance: {p.distanceKm} km</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ================================================================
                PERFORMANCE TAB
                ================================================================ */}
            <TabsContent value="performance" className="space-y-6">
              {/* Revenue per sqm */}
              {overview && (
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <Card className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Revenue / sqm
                        </span>
                      </div>
                      <p className="text-2xl font-bold">
                        CHF {overview.avgRevenuePerSqm.toFixed(1)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Members / sqm
                        </span>
                      </div>
                      <p className="text-2xl font-bold">
                        {(overview.currentMembers / overview.gymAreaSqm).toFixed(2)}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="glass-card">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">
                          Total Monthly Rev.
                        </span>
                      </div>
                      <p className="text-2xl font-bold">
                        CHF {plzData.reduce((s, p) => s + p.monthlyRevenue, 0).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Utilization heatmap */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Weekly Utilization Heatmap
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {heatmapData.length > 0 ? (
                    <UtilizationHeatmap data={heatmapData} />
                  ) : (
                    <p className="text-muted-foreground text-sm py-8 text-center">
                      No utilization data available.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Seasonal patterns */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Seasonal Patterns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {seasonalData.length > 0 ? (
                    <SeasonalPatternsChart data={seasonalData} />
                  ) : (
                    <p className="text-muted-foreground text-sm py-8 text-center">
                      No seasonal data available.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* ================================================================
                COMPETITION TAB
                ================================================================ */}
            <TabsContent value="competition" className="space-y-6">
              {/* Competitor table */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    Competitors
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CompetitorTable
                    competitors={competitors}
                    onAdd={handleAddCompetitor}
                    onEdit={handleEditCompetitor}
                    onDelete={(id) => deleteCompetitor.mutate(id)}
                  />
                </CardContent>
              </Card>

              <div className="grid lg:grid-cols-2 gap-6">
                {/* Market share pie */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Market Share
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MarketShareChart
                      competitors={competitors}
                      gymMembers={overview?.currentMembers ?? 0}
                      gymName={gym?.name ?? 'Your Gym'}
                    />
                  </CardContent>
                </Card>

                {/* Pricing scatter */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      Pricing Position
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PricingPositionChart
                      competitors={competitors}
                      gymPrice={95}
                      gymMembers={overview?.currentMembers ?? 0}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Competitor dialog */}
              <CompetitorDialog
                open={competitorDialogOpen}
                onOpenChange={setCompetitorDialogOpen}
                competitor={editingCompetitor}
                onSave={handleSaveCompetitor}
              />
            </TabsContent>

            {/* ================================================================
                EXPANSION TAB
                ================================================================ */}
            <TabsContent value="expansion" className="space-y-6">
              {/* Scenarios */}
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Expansion Scenarios</h2>
                <Button size="sm" onClick={handleAddScenario}>
                  <Plus className="h-4 w-4 mr-2" />
                  New Scenario
                </Button>
              </div>

              {expansionScenarios.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {expansionScenarios.map((scenario) => (
                    <ExpansionScenarioCard
                      key={scenario.id}
                      scenario={scenario}
                      onEdit={() => handleEditScenario(scenario)}
                      onDelete={() => deleteScenario.mutate(scenario.id)}
                    />
                  ))}
                </div>
              ) : (
                <Card className="glass-card">
                  <CardContent className="p-8 text-center text-muted-foreground">
                    No expansion scenarios yet. Create one to evaluate potential
                    new locations.
                  </CardContent>
                </Card>
              )}

              {/* ROI Calculator */}
              <ROICalculator />

              {/* Scenario dialog */}
              <NewScenarioDialog
                open={scenarioDialogOpen}
                onOpenChange={setScenarioDialogOpen}
                scenario={editingScenario}
                onSave={handleSaveScenario}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </FeatureGate>
  );
};

export default LocationAnalysis;
