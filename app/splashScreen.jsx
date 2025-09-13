import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { useRouter } from "expo-router"; // ✅ navigation

const { width, height } = Dimensions.get("window");
const MAX_DISTANCE = 160;

// Generate floating tasks
const generateTasks = (count) => {
  const statuses = ["pending", "in-progress", "completed"];
  return Array.from({ length: count }, (_, i) => ({
    id: `task-${i}`,
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.6,
    vy: (Math.random() - 0.5) * 0.6,
    r: 6 + Math.random() * 4,
    status: statuses[Math.floor(Math.random() * statuses.length)],
  }));
};

const statusColors = {
  pending: "#B0BEC5", // gray
  "in-progress": "#FFD93D", // yellow
  completed: "#6BCB77", // green
};

const getDistance = (p1, p2) =>
  Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

const TaskGenerativeSplash = () => {
  const [tasks, setTasks] = useState(generateTasks(25));
  const router = useRouter();

  useEffect(() => {
    let animationFrameId;

    const animateTasks = () => {
      setTasks((prevTasks) =>
        prevTasks.map((t) => {
          let { x, y, vx, vy, r, status } = t;

          // Bounce off edges
          if (x + r > width || x - r < 0) vx *= -1;
          if (y + r > height || y - r < 0) vy *= -1;

          // Attraction to clusters by status
          let targetX, targetY;
          if (status === "pending") {
            targetX = width * 0.25;
            targetY = height * 0.4;
          } else if (status === "in-progress") {
            targetX = width * 0.5;
            targetY = height * 0.5;
          } else {
            targetX = width * 0.75;
            targetY = height * 0.6;
          }

          vx += (targetX - x) * 0.001;
          vy += (targetY - y) * 0.001;

          return { ...t, x: x + vx, y: y + vy, vx, vy };
        })
      );

      animationFrameId = requestAnimationFrame(animateTasks);
    };

    animateTasks();

    // ✅ Redirect after 3 seconds
    const timer = setTimeout(() => {
      router.replace("/addTask");
    }, 3000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timer);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
        {/* Connect tasks with lines */}
        {tasks.map((t1, i) =>
          tasks.map((t2, j) => {
            if (i < j && t1.status === t2.status) {
              const dist = getDistance(t1, t2);
              if (dist < MAX_DISTANCE) {
                const opacity = 0.5 * (1 - dist / MAX_DISTANCE);
                return (
                  <Line
                    key={`${i}-${j}`}
                    x1={t1.x}
                    y1={t1.y}
                    x2={t2.x}
                    y2={t2.y}
                    stroke={statusColors[t1.status]}
                    strokeOpacity={opacity}
                    strokeWidth={1.2}
                  />
                );
              }
            }
            return null;
          })
        )}

        {/* Draw task nodes */}
        {tasks.map((t) => (
          <Circle
            key={t.id}
            cx={t.x}
            cy={t.y}
            r={t.r}
            fill={statusColors[t.status]}
            stroke="#ECEFF1"
            strokeWidth={2}
          />
        ))}
      </Svg>

      {/* App Title + Tagline */}
      <View style={styles.textWrapper}>
        <Text style={styles.logo}>Task Nest</Text>
        <Text style={styles.subtitle}>Visualize your tasks at a glance</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
  },
  textWrapper: {
    position: "absolute",
    alignItems: "center",
  },
  logo: {
    fontSize: 36,
    fontWeight: "800",
    color: "#2C3E50",
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    fontStyle: "italic",
    color: "#607D8B",
    textAlign: "center",
  },
});

export default TaskGenerativeSplash;
    