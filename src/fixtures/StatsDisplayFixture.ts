import { Stat } from "../components/StatsDisplay/StatsDisplay";

  export const GameStats: Stat[] = [
    {
      label: 'Kills',
      value: 45,
      icon: '🎯',
      trend: 'up'
    },
    {
      label: 'Deaths',
      value: 12,
      icon: '💀',
      trend: 'down'
    },
    {
      label: 'Time',
      value: 127,
      suffix: 'hrs',
      icon: '⏱️',
      trend: 'neutral'
    },
    {
      label: 'Zombies',
      value: '1,234',
      icon: '🧟',
      trend: 'up'
    }
  ];
