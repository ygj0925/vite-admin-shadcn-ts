import { ResponsiveContainer } from 'recharts'

const TESLA_COLORS = ['#3E6AE1', '#171A20', '#5C5E62', '#8E8E8E', '#D0D1D2', '#EEEEEE']

interface ChartProps {
  children: React.ReactNode
  height?: number
}

export function ChartContainer({ children, height = 300 }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      {children}
    </ResponsiveContainer>
  )
}

export { TESLA_COLORS }
