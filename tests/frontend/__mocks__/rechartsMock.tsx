import * as React from 'react';
type Props = { children?: React.ReactNode };

export const ResponsiveContainer: React.FC<Props> = ({ children }) => <div>{children}</div>;
export const PieChart: React.FC<Props> = ({ children }) => <div data-testid="pie-chart">{children}</div>;
export const Pie: React.FC<Props> = ({ children }) => <div>{children}</div>;
export const Cell: React.FC<Props> = ({ children }) => <div>{children}</div>;
export const Tooltip: React.FC = () => <div data-testid="tooltip" />;
export const BarChart: React.FC<Props> = ({ children }) => <div data-testid="bar-chart">{children}</div>;
export const Bar: React.FC<Props> = ({ children }) => <div>{children}</div>;
export const XAxis: React.FC = () => <div />;
export const YAxis: React.FC = () => <div />;
export const CartesianGrid: React.FC = () => <div />;