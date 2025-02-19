import { DetailedTask, Task } from "@/app/components/dayGrid/types";
import { useEffect, useLayoutEffect, useRef } from "react";
import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent
} from 'echarts/components';
import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
    LineChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer
]);

type TaskStatsChartProps = {
    task: Task | DetailedTask;
};

export const TaskStatsChart = ({ task }: TaskStatsChartProps) => {
    const chartRef = useRef(null);

    useLayoutEffect(() => {
        if (chartRef.current) {
            const activitiesChart = echarts.init(chartRef.current);

            // last seven days including today:
            const dates = Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                return date.toISOString().split('T')[0];
            }).reverse();

            const groupedInstances = task.taskInstances
                .filter(instance => {
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

            activitiesChart.setOption({
                title: {
                    text: 'Last week'
                },
                tooltip: {},
                xAxis: {
                    data: dates
                },
                yAxis: {},
                series: [
                    {
                        name: 'sales',
                        type: 'line',
                        data: dates.map(date => groupedInstances[date] || 0)
                    }
                ]
            });
        }
    }, [task]);

    return (
        <div
            ref={chartRef}
            style={{ width: '100%', height: '400px' }}
        />
    );
};