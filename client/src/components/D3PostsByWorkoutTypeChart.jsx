// D3 bar chart — Posts by Workout Type.
// Data is fetched from MongoDB via /api/stats/posts-by-workout-type and
// rendered into an SVG using D3 scales, axes, and transitions.

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const MARGIN = { top: 20, right: 20, bottom: 60, left: 50 };
const HEIGHT = 320;
const COLORS = ['#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'];

export default function D3PostsByWorkoutTypeChart({ data }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  function draw() {
    if (!data || data.length === 0 || !svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth || 600;
    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = HEIGHT - MARGIN.top - MARGIN.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('width', width).attr('height', HEIGHT);

    const g = svg.append('g').attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    const x = d3.scaleBand()
      .domain(data.map((d) => d.workoutType))
      .range([0, innerW])
      .padding(0.25);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => d.postCount) * 1.1])
      .range([innerH, 0]);

    // Grid lines.
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).tickSize(-innerW).tickFormat(''))
      .selectAll('line').attr('stroke', '#f3f4f6');
    g.select('.grid .domain').remove();

    // Bars with transition.
    g.selectAll('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.workoutType))
      .attr('width', x.bandwidth())
      .attr('y', innerH)
      .attr('height', 0)
      .attr('fill', (_, i) => COLORS[i % COLORS.length])
      .attr('rx', 4)
      .transition().duration(600).ease(d3.easeCubicOut)
      .attr('y', (d) => y(d.postCount))
      .attr('height', (d) => innerH - y(d.postCount));

    // Value labels on bars.
    g.selectAll('.bar-label')
      .data(data)
      .join('text')
      .attr('class', 'bar-label')
      .attr('x', (d) => x(d.workoutType) + x.bandwidth() / 2)
      .attr('y', (d) => y(d.postCount) - 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', 12)
      .attr('fill', '#374151')
      .attr('opacity', 0)
      .text((d) => d.postCount)
      .transition().delay(600).attr('opacity', 1);

    // X axis.
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('font-size', 11)
      .attr('fill', '#6b7280')
      .attr('transform', 'rotate(-25)')
      .attr('text-anchor', 'end');

    // Y axis.
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('d')))
      .selectAll('text').attr('font-size', 11).attr('fill', '#6b7280');

    // Y axis label.
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -40).attr('x', -innerH / 2)
      .attr('text-anchor', 'middle')
      .attr('font-size', 12).attr('fill', '#6b7280')
      .text('Number of Posts');
  }

  useEffect(() => { draw(); }, [data]);

  // Re-draw when the container is resized (e.g. window resize, orientation change).
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [data]);

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <svg ref={svgRef} style={{ width: '100%', display: 'block' }} />
    </div>
  );
}
