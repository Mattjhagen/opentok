import { useState } from 'react';
import { TrendingUp, Eye, Settings, Info, BarChart3, Users, Clock, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';

interface AlgorithmPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AlgorithmPanel({ isOpen, onClose }: AlgorithmPanelProps) {
  const [engagementWeight, setEngagementWeight] = useState([70]);
  const [diversityWeight, setDiversityWeight] = useState([30]);
  const [recencyWeight, setRecencyWeight] = useState([50]);
  const [personalizedContent, setPersonalizedContent] = useState(true);
  const [trendingBoost, setTrendingBoost] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-card border-l border-border overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Eye className="w-6 h-6 text-primary" />
                Algorithm Transparency
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                See exactly how your feed is personalized
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>

          {/* Current Video Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Current Video Score
              </CardTitle>
              <CardDescription>
                Why this video was recommended to you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold text-primary">94%</div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Engagement Rate</span>
                  <Badge variant="secondary">High</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Trending Factor</span>
                  <Badge variant="secondary">Very High</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Similar Interests</span>
                  <Badge variant="secondary">Medium</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Creator Popularity</span>
                  <Badge variant="secondary">High</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Algorithm Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Customize Your Feed
              </CardTitle>
              <CardDescription>
                Adjust how content is selected for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Engagement Weight */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Engagement Priority
                  </label>
                  <span className="text-sm text-muted-foreground">{engagementWeight[0]}%</span>
                </div>
                <Slider
                  value={engagementWeight}
                  onValueChange={setEngagementWeight}
                  max={100}
                  step={5}
                  className="[&_[role=slider]]:bg-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Higher values prioritize popular, highly-engaged content
                </p>
              </div>

              {/* Diversity Weight */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Content Diversity
                  </label>
                  <span className="text-sm text-muted-foreground">{diversityWeight[0]}%</span>
                </div>
                <Slider
                  value={diversityWeight}
                  onValueChange={setDiversityWeight}
                  max={100}
                  step={5}
                  className="[&_[role=slider]]:bg-accent"
                />
                <p className="text-xs text-muted-foreground">
                  Higher values show more varied content from different creators
                </p>
              </div>

              {/* Recency Weight */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Fresh Content Priority
                  </label>
                  <span className="text-sm text-muted-foreground">{recencyWeight[0]}%</span>
                </div>
                <Slider
                  value={recencyWeight}
                  onValueChange={setRecencyWeight}
                  max={100}
                  step={5}
                  className="[&_[role=slider]]:bg-destructive"
                />
                <p className="text-xs text-muted-foreground">
                  Higher values prioritize recently uploaded content
                </p>
              </div>

              {/* Toggle Settings */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Personalized Content</label>
                    <p className="text-xs text-muted-foreground">
                      Use your activity to personalize recommendations
                    </p>
                  </div>
                  <Switch
                    checked={personalizedContent}
                    onCheckedChange={setPersonalizedContent}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium">Trending Boost</label>
                    <p className="text-xs text-muted-foreground">
                      Prioritize currently trending videos
                    </p>
                  </div>
                  <Switch
                    checked={trendingBoost}
                    onCheckedChange={setTrendingBoost}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Open Source Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Open Source
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Our algorithm is completely open source. View the code, suggest improvements, or run your own instance.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                View on GitHub
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}