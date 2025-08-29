import React from 'react';
import { 
  Ship, 
  Waves, 
  Anchor, 
  Navigation, 
  TrendingUp, 
  DollarSign, 
  Shield, 
  Target,
  BarChart3,
  PieChart,
  Activity,
  MapPin,
  Globe,
  Compass,
  Award,
  AlertTriangle,
  CheckCircle,
  Clock,
  Fuel,
  Users,
  Building,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  FileText,
  Database
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ComponentType<any>;
  color?: 'primary' | 'success' | 'warning' | 'destructive' | 'accent';
  subtitle?: string;
  description?: string;
  timeframe?: string;
}

interface ExecutiveSummaryProps {
  title: string;
  overview: string;
  keyMetrics: Array<{
    label: string;
    value: string | number;
    change?: number;
    icon: React.ComponentType<any>;
    description?: string;
    timeframe?: string;
  }>;
  criticalFindings: string[];
  confidenceLevel?: number;
}

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon: React.ComponentType<any>;
  number?: number;
}

interface ReportHeaderProps {
  title: string;
  reportType: string;
  generatedDate: string;
  confidenceLevel?: number;
  dataPoints?: number;
  validUntil?: string;
  companyLogo?: boolean;
}

// Maritime-themed gradient backgrounds
const MaritimeBackground: React.FC<{ children: React.ReactNode; variant?: 'ocean' | 'sunset' | 'deep' | 'surface' }> = ({ 
  children, 
  variant = 'ocean' 
}) => {
  const gradients = {
    ocean: 'bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900',
    sunset: 'bg-gradient-to-br from-slate-800 via-orange-900 to-red-900',
    deep: 'bg-gradient-to-br from-slate-950 via-indigo-950 to-blue-950',
    surface: 'bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-950'
  };

  return (
    <div className={`${gradients[variant]} relative overflow-hidden`}>
      {/* Wave pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1000 100" preserveAspectRatio="none">
          <path d="M0,50 C150,20 350,80 500,50 C650,20 850,80 1000,50 L1000,100 L0,100 Z" 
                fill="currentColor" className="text-white/20" />
        </svg>
      </div>
      {children}
    </div>
  );
};

// Professional metric card with maritime styling
export const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  trend = 'neutral', 
  icon: Icon, 
  color = 'primary',
  subtitle,
  description,
  timeframe
}) => {
  const colorClasses = {
    primary: 'border-primary/30 bg-primary/5 text-primary-foreground',
    success: 'border-success/30 bg-success/5 text-success-foreground', 
    warning: 'border-warning/30 bg-warning/5 text-warning-foreground',
    destructive: 'border-destructive/30 bg-destructive/5 text-destructive-foreground',
    accent: 'border-accent/30 bg-accent/5 text-accent-foreground'
  };

  const trendIcon = trend === 'up' ? ArrowUpRight : trend === 'down' ? ArrowDownRight : null;
  const TrendIcon = trendIcon;

  return (
    <Card className={`${colorClasses[color]} border-2 shadow-xl backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:scale-105`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground opacity-80 uppercase tracking-wide">{title}</p>
              {timeframe && (
                <Badge variant="outline" className="text-xs px-2 py-1 text-foreground border-foreground/20">
                  <Clock className="w-3 h-3 mr-1" />
                  {timeframe}
                </Badge>
              )}
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
              {change && TrendIcon && (
                <div className={`flex items-center text-sm font-medium ${
                  trend === 'up' ? 'text-success' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                }`}>
                  <TrendIcon className="w-4 h-4 mr-1" />
                  {Math.abs(change)}%
                </div>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-foreground opacity-70">{subtitle}</p>
            )}
            {description && (
              <details className="text-xs text-foreground opacity-60 cursor-pointer">
                <summary className="hover:opacity-80 font-medium">Calculation Details</summary>
                <p className="mt-2 text-xs leading-relaxed border-l-2 border-primary/20 pl-2 ml-1 text-foreground">
                  {description}
                </p>
              </details>
            )}
          </div>
          <div className="ml-4">
            <Icon className="w-8 h-8 text-foreground opacity-80" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Professional report header with maritime branding
export const ReportHeader: React.FC<ReportHeaderProps> = ({
  title,
  reportType,
  generatedDate,
  confidenceLevel,
  dataPoints,
  validUntil,
  companyLogo = true
}) => {
  return (
    <MaritimeBackground variant="deep">
      <div className="relative p-8 text-white">
        {/* Company branding */}
        {companyLogo && (
          <div className="flex items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center backdrop-blur-sm border border-primary/30">
                <Ship className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Maritime Intelligence</h3>
                <p className="text-sm text-blue-200">Strategic Analytics Platform</p>
              </div>
            </div>
            <div className="ml-auto flex items-center space-x-4">
              {confidenceLevel && (
                <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                  <Target className="w-3 h-3 mr-1" />
                  {Math.round(confidenceLevel * 100)}% Confidence
                </Badge>
              )}
              {dataPoints && (
                <Badge variant="secondary" className="bg-white/10 text-white border-white/20">
                  <Database className="w-3 h-3 mr-1" />
                  {dataPoints.toLocaleString()} Data Points
                </Badge>
              )}
            </div>
          </div>
        )}
        
        {/* Report title */}
        <div className="space-y-4">
          <div>
            <Badge className="mb-3 bg-accent/20 text-accent border-accent/30">
              {reportType.replace(/_/g, ' ').toUpperCase()}
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight mb-2">{title}</h1>
          </div>
          
          {/* Report metadata */}
          <div className="flex items-center space-x-6 text-sm text-blue-100">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Generated: {new Date(generatedDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
            {validUntil && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                Valid Until: {new Date(validUntil).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Decorative maritime elements */}
        <div className="absolute top-4 right-4 opacity-20">
          <Compass className="w-16 h-16 text-white animate-spin" style={{ animationDuration: '20s' }} />
        </div>
        <div className="absolute bottom-4 left-4 opacity-10">
          <Anchor className="w-8 h-8 text-white" />
        </div>
      </div>
    </MaritimeBackground>
  );
};

// Executive summary with professional layout
export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({
  title,
  overview,
  keyMetrics,
  criticalFindings,
  confidenceLevel
}) => {
  return (
    <Card className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 border-2 border-primary/20 shadow-2xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center text-primary">
            <Award className="w-6 h-6 mr-3" />
            {title}
          </CardTitle>
          {confidenceLevel && (
            <Progress value={confidenceLevel * 100} className="w-32" />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview */}
        <div className="bg-card/80 backdrop-blur-sm p-6 rounded-lg border border-border">
          <p className="text-base leading-relaxed text-foreground">{overview}</p>
        </div>
        
        {/* Key metrics grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {keyMetrics.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.label}
              value={metric.value}
              change={metric.change}
              icon={metric.icon}
              color="primary"
              description={metric.description}
              timeframe={metric.timeframe}
            />
          ))}
        </div>
        
        {/* Critical findings */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 p-6 rounded-lg border-l-4 border-warning">
          <h4 className="font-semibold text-warning mb-3 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Critical Findings
          </h4>
          <ul className="space-y-2">
            {criticalFindings.map((finding, index) => (
              <li key={index} className="flex items-start text-sm">
                <div className="w-2 h-2 bg-warning rounded-full mt-2 mr-3 flex-shrink-0" />
                {finding}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

// Section header with maritime styling
export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, icon: Icon, number }) => {
  return (
    <div className="flex items-center space-x-4 mb-6">
      <div className="flex items-center space-x-3">
        {number && (
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold border-2 border-primary/30">
            {number}
          </div>
        )}
        <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg flex items-center justify-center border border-primary/30">
          <Icon className="w-6 h-6 text-primary" />
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-primary">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};

// Financial KPI dashboard
export const FinancialDashboard: React.FC<{
  metrics: Array<{
    label: string;
    value: string;
    change?: number;
    trend?: 'up' | 'down' | 'neutral';
    description?: string;
  }>;
}> = ({ metrics }) => {
  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-success/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center text-success">
          <DollarSign className="w-6 h-6 mr-3" />
          Financial Impact Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <MetricCard
                title={metric.label}
                value={metric.value}
                change={metric.change}
                trend={metric.trend}
                icon={DollarSign}
                color="success"
              />
              {metric.description && (
                <div className="bg-card/80 backdrop-blur-sm p-3 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    <span className="font-medium text-success">Calculation: </span>
                    {metric.description}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Risk assessment matrix
export const RiskMatrix: React.FC<{
  risks: Array<{
    category: string;
    level: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    mitigation?: string;
  }>;
}> = ({ risks }) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'success';
      case 'medium': return 'warning';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'primary';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-2 border-destructive/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center text-destructive">
          <Shield className="w-6 h-6 mr-3" />
          Strategic Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {risks.map((risk, index) => (
          <div key={index} className="bg-card/80 backdrop-blur-sm p-4 rounded-lg border-l-4 border-destructive/30">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-base text-foreground">{risk.category}</h4>
              <Badge 
                variant={getRiskColor(risk.level) === 'success' ? 'secondary' : 'destructive'}
                className={`${getRiskColor(risk.level) === 'success' ? 'bg-success/20 text-success-foreground' : 
                           getRiskColor(risk.level) === 'warning' ? 'bg-warning/20 text-warning-foreground' : 
                           'bg-destructive/20 text-destructive-foreground'}`}
              >
                {risk.level.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{risk.description}</p>
            {risk.mitigation && (
              <div className="text-xs bg-primary/10 p-2 rounded border border-primary/20">
                <span className="font-medium text-primary">Mitigation: </span>
                <span className="text-foreground">{risk.mitigation}</span>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

// Implementation roadmap with timeline
export const ImplementationRoadmap: React.FC<{
  phases: Array<{
    title: string;
    duration: string;
    description: string;
    actions: string[];
    investment?: number;
    expectedReturn?: number;
  }>;
}> = ({ phases }) => {
  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-primary/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold flex items-center text-primary">
          <Navigation className="w-6 h-6 mr-3" />
          Implementation Roadmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {phases.map((phase, index) => (
            <div key={index} className="relative">
              {index < phases.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-primary/30" />
              )}
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold border-2 border-primary/30 bg-card">
                  {index + 1}
                </div>
                <div className="flex-1 bg-card/80 backdrop-blur-sm p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-lg">{phase.title}</h4>
                    <Badge variant="outline" className="border-primary text-primary">
                      {phase.duration}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{phase.description}</p>
                  
                  <div className="space-y-2 mb-3">
                    {phase.actions.map((action, actionIndex) => (
                      <div key={actionIndex} className="flex items-start text-sm">
                        <CheckCircle className="w-4 h-4 text-success mt-0.5 mr-2 flex-shrink-0" />
                        {action}
                      </div>
                    ))}
                  </div>
                  
                  {(phase.investment || phase.expectedReturn) && (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {phase.investment && (
                        <div className="bg-destructive/10 p-2 rounded">
                          <span className="text-destructive font-medium">Investment: </span>
                          €{phase.investment.toLocaleString()}
                        </div>
                      )}
                      {phase.expectedReturn && (
                        <div className="bg-success/10 p-2 rounded">
                          <span className="text-success font-medium">Expected Return: </span>
                          €{phase.expectedReturn.toLocaleString()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export { MaritimeBackground };