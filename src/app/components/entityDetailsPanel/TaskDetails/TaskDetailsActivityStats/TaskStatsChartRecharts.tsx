import { DetailedTask, Task } from "@/app/components/dayGrid/types";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Label,
} from "recharts";

type TaskStatsChartProps = {
  task: Task | DetailedTask;
};

export const TaskStatsChartRecharts = ({ task }: TaskStatsChartProps) => {
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toLocaleDateString("en-CA");
  }).reverse();

  const groupedInstances = task.taskInstances
    .filter((instance) => {
      const instanceDate = new Date(instance.start.date);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return instanceDate >= weekAgo && instanceDate <= now;
    })
    .reduce((acc, instance) => {
      const date = instance.start.date;
      acc[date] = (acc[date] || 0) + instance.duration;
      return acc;
    }, {} as { [key: string]: number });

  const data = dates.map((date) => ({
    date,
    duration: groupedInstances[date] || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 6" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => {
            const date = new Date(value);
            const isToday =
              date.toLocaleDateString("en-CA") ===
              new Date().toLocaleDateString("en-CA");
            const isYesterday =
              date.toLocaleDateString("en-CA") ===
              new Date(
                new Date().getTime() - 24 * 60 * 60 * 1000
              ).toLocaleDateString("en-CA");
            if (isToday) {
              return "Today";
            } else if (isYesterday) {
              return "Yesterday";
            }
            return date.toLocaleDateString("en-US", { weekday: "long" });
          }}
          interval={"equidistantPreserveStart"}
          angle={-45}
          textAnchor="end"
          height={80}
          padding={{ left: 20, right: 20 }}
        ></XAxis>
        <YAxis name="minutes">
          <Label value="minutes" angle={-90} position="insideLeft" />
        </YAxis>
        <Tooltip />
        <Line type="linear" dataKey="duration" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
};
