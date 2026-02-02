
export type Stat = {
    label: string;
    value: number | string;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    suffix?: string;
}

interface StatsDisplayProps {
  stats: Stat[];
  columns?: 2 | 3 | 4;
  size?: 'sm' | 'md' | 'lg';
}


export const StatsDisplay = ({stats, columns = 4, size = 'sm' }: StatsDisplayProps) => {
const sizeClasses = {
    sm: {
      card: 'p-4',
      icon: 'w-10 h-10 text-3xl',
      label: 'text-xs',
      value: 'text-xl',
      trend: 'text-xs'
    },
    md: {
      card: 'p-6',
      icon: 'w-16 h-16 text-5xl',
      label: 'text-sm',
      value: 'text-3xl',
      trend: 'text-sm'
    },
    lg: {
      card: 'p-8',
      icon: 'w-20 h-20 text-6xl',
      label: 'text-base',
      value: 'text-4xl',
      trend: 'text-base'
    }
  };

  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4'
  };

  const getTrendIcon = (trend: Stat['trend']) => {
    if (!trend || trend === 'neutral') return null;
    return trend === 'up' ? '↑' : '↓';
  };

  const getTrendColor = (trend: Stat['trend']) => {
    if (!trend || trend === 'neutral') return 'text-gray-400';
    return trend === 'up' ? 'text-green-400' : 'text-red-400';
  };

  const classes = sizeClasses[size];

  return (
    <div className={`grid grid-cols-1 ${gridCols[columns]} gap-6`}>
      {stats.map((stat, index) => (
        <div 
          key={index}
          className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl ${classes.card} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border border-gray-700`}
        >
          <div className="flex flex-col items-center space-y-3">
            {stat.icon && (
              <div className={`${classes.icon} bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md`}>
                <span className="filter drop-shadow-lg">{stat.icon}</span>
              </div>
            )}
            
            <h3 className={`text-gray-400 ${classes.label} font-semibold uppercase tracking-wider`}>
              {stat.label}
            </h3>
            
            <p className={`${classes.value} font-bold text-white`}>
              {stat.value}{stat.suffix && <span className="text-gray-400 ml-1">{stat.suffix}</span>}
            </p>
            
            {stat.trend && stat.trend !== 'neutral' && (
              <div className={`flex items-center space-x-1 ${classes.trend} font-medium ${getTrendColor(stat.trend)}`}>
                <span>{getTrendIcon(stat.trend)}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}