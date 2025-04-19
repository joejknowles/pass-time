import { DetailedTask, Task } from "@/app/components/dayGrid/types";
import { useLayoutEffect, useRef } from "react";
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
        if (chartRef.current && "stats" in task) {
            const activitiesChart = echarts.init(chartRef.current);

            const dates = Array.from({ length: 7 }, (_, i) => {
                const date = new Date();
                date.setDate(date.getDate() - i);
                return date.toLocaleDateString('en-CA');
            }).reverse();

            const dataValues = dates.map(date => {
                return task.stats.data.daily.find((d: { date: string; value: number }) => d.date === date)?.value
            })

            activitiesChart.setOption({
                title: {
                    text: 'This week'
                },
                tooltip: {},
                xAxis: {
                    data: dates,
                    axisTick: {
                        alignWithLabel: true,
                        length: 7,
                    },
                    axisLabel: {
                        interval: 0,
                        rotate: 45,
                        margin: 12,
                        formatter: (value: string) => {
                            const date = new Date(value);
                            const isToday = date.toLocaleDateString('en-CA') === new Date().toLocaleDateString('en-CA');
                            const isYesterday = date.toLocaleDateString('en-CA') === new Date(new Date().getTime() - 24 * 60 * 60 * 1000).toLocaleDateString('en-CA');
                            if (isToday) {
                                return 'Today';
                            } else if (isYesterday) {
                                return 'Yesterday';
                            }
                            return date.toLocaleDateString('en-US', { weekday: 'long' });
                        },
                    },
                },
                yAxis: {
                    name: 'minutes',
                    nameLocation: 'middle',
                    nameRotate: 90,
                    nameGap: 40
                },
                series: [
                    {
                        name: 'sales',
                        type: 'line',
                        data: dataValues
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