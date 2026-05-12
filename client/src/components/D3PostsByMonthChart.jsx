// D3 line chart — Posts by Month.
// Data is fetched from MongoDB via /api/stats/posts-by-month.

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const MARGIN = { top: 20, right: 20, bottom: 50, left: 50 };
const HEIGHT = 320;
const LINE_COLOR = '#1d4ed8';

export default function D3PostsByMonthChart({ data }) {
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

    const x = d3.scalePoint()
      .domain(data.map((d) => d.month))
      .range([0, innerW])
      .padding(0.3);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, (d) => d.postCount) * 1.1])
      .range([innerH, 0]);

    // Grid lines.
    g.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).tickSize(-innerW).tickFormat(''))
      .selectAll('line').attr('stroke', '#f3f4f6');
    g.select('.grid .domain').remove();

    // Area fill under the line.
    const area = d3.area()
      .x((d) => x(d.month))
      .y0(innerH)
      .y1((d) => y(d.postCount))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', '#dbeafe')
      .attr('d', area);

    // Line path with draw animation.
    const line = d3.line()
      .x((d) => x(d.month))
      .y((d) => y(d.postCount))
      .curve(d3.curveMonotoneX);

    const path = g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', LINE_COLOR)
      .attr('stroke-width', 2.5)
      .attr('d', line);

    const totalLength = path.node().getTotalLength();
    path
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition().duration(800).ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    // Data point circles.
    g.selectAll('.dot')
      .data(data)
      .join('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => x(d.month))
      .attr('cy', (d) => y(d.postCount))
      .attr('r', 0)
      .attr('fill', LINE_COLOR)
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .transition().delay(800).duration(200)
      .attr('r', 5);

    // Value labels above dots.
    g.selectAll('.dot-label')
      .data(data)
      .join('text')
      .attr('class', 'dot-label')
      .attr('x', (d) => x(d.month))
      .attr('y', (d) => y(d.postCount) - 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', 11)
      .attr('fill', '#374151')
      .attr('opacity', 0)
      .text((d) => d.postCount)
      .transition().delay(1000).attr('opacity', 1);

    // X axis.
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('font-size', 11).attr('fill', '#6b7280')
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
