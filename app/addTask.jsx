import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";

const AddTask = () => {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [tasks, setTasks] = useState([]);
  const [deletedTasks, setDeletedTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("all");

  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [confirmType, setConfirmType] = useState(null);
  const [selectedTaskIdForAction, setSelectedTaskIdForAction] = useState(null);

  // ✅ Current formatted date
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ✅ Add Task
  const addTask = () => {
    if (title.trim() === "" || subject.trim() === "") {
      alert("Please enter both subject and title!");
      return;
    }

    if (
      tasks.some(
        (t) =>
          t.title.toLowerCase() === title.trim().toLowerCase() &&
          t.subject.toLowerCase() === subject.trim().toLowerCase()
      )
    ) {
      alert("This task already exists!");
      return;
    }

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const formattedHours = hours % 12 === 0 ? 12 : hours % 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const currentTime = `${formattedHours}:${formattedMinutes} ${ampm}`;

    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        title: title.trim(),
        subject: subject.trim(),
        bg: "#FFF",
        time: `Created at ${currentTime}`,
      },
    ]);

    setTitle("");
    setSubject("");
  };

  const toggleHighlight = (id) => {
    setSelectedTaskId((prev) => (prev === id ? null : id));
  };

  const completeTask = (id) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, bg: t.bg === "#FFF" ? "#E8F8F5" : "#FFF" } : t
      )
    );
  };

  const deleteTask = (id) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (taskToDelete) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setDeletedTasks([{ ...taskToDelete, category: "Active Task" }, ...deletedTasks]);
    }
  };

  const deleteCompletedTask = (id) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (taskToDelete) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
      setDeletedTasks([{ ...taskToDelete, bg: "#FFF", category: "Completed Task" }, ...deletedTasks]);
    }
  };

  const restoreTask = (id) => {
    const taskToRestore = deletedTasks.find((t) => t.id === id);
    if (taskToRestore) {
      setDeletedTasks((prev) => prev.filter((t) => t.id !== id));
      setTasks((prev) => [...prev, { ...taskToRestore, bg: "#FFF" }]);
    }
  };

  const permanentDelete = (id) => {
    setDeletedTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const openConfirm = (type, id) => {
    setConfirmType(type);
    setSelectedTaskIdForAction(id);
    setConfirmVisible(true);
  };

  const handleConfirm = () => {
    if (confirmType === "delete") {
      permanentDelete(selectedTaskIdForAction);
    } else if (confirmType === "complete") {
      completeTask(selectedTaskIdForAction);
    } else if (confirmType === "softDelete") {
      deleteTask(selectedTaskIdForAction);
    } else if (confirmType === "softDeleteCompleted") {
      deleteCompletedTask(selectedTaskIdForAction);
    } else if (confirmType === "restore") {
      restoreTask(selectedTaskIdForAction);
    }
    setConfirmVisible(false);
    setConfirmType(null);
    setSelectedTaskIdForAction(null);
  };

  const filteredTasks =
    activeTab === "all"
      ? tasks.filter((t) => t.bg === "#FFF")
      : activeTab === "completed"
      ? tasks.filter((t) => t.bg !== "#FFF")
      : deletedTasks;

  const activeCount = tasks.filter((t) => t.bg === "#FFF").length;
  const completedCount = tasks.filter((t) => t.bg !== "#FFF").length;

  const renderRightActions = (id, isDone) => (
    <View style={{ flexDirection: "row", marginVertical: 6 }}>
      <TouchableOpacity
        style={[
          styles.completeAction,
          { backgroundColor: isDone ? "#95A5A6" : "#27AE60" },
        ]}
        onPress={() => openConfirm("complete", id)}
      >
        <Ionicons
          name={isDone ? "refresh-outline" : "checkmark-done-outline"}
          size={22}
          color="#FFF"
        />
        <Text style={styles.actionText}>{isDone ? "Undo" : "Complete"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => openConfirm("softDelete", id)}
      >
        <Ionicons name="trash-outline" size={22} color="#FFF" />
        <Text style={styles.actionText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Today’s Tasks</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity onPress={() => setActiveTab("all")}>
          <Text style={[styles.tab, activeTab === "all" && styles.activeTab]}>
            All {activeCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("completed")}>
          <Text
            style={[styles.tab, activeTab === "completed" && styles.activeTab]}
          >
            Completed {completedCount}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("deleted")}>
          <Text
            style={[styles.tab, activeTab === "deleted" && styles.activeTab]}
          >
            Deleted {deletedTasks.length}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Remaining Counter */}
      {activeTab === "all" && (
        <Text style={styles.counter}>
          {activeCount} {activeCount === 1 ? "task" : "tasks"} remaining
        </Text>
      )}

      {/* Input Card */}
      {activeTab === "all" && (
        <View style={styles.inputCard}>
          <TextInput
            style={styles.input}
            placeholder="Subject (e.g. Project, Class, Category)"
            value={subject}
            onChangeText={setSubject}
            placeholderTextColor="#999"
          />
          <TextInput
            style={styles.input}
            placeholder="Task title"
            value={title}
            onChangeText={setTitle}
            onSubmitEditing={addTask}
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.addTaskBtn} onPress={addTask}>
            <Ionicons name="add-circle" size={28} color="#FFF" />
            <Text style={styles.addTaskText}>Add Task</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Task List */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) =>
          activeTab === "deleted" ? (
            <View style={styles.taskCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.taskTitle}>{item.title}</Text>
                <Text style={styles.taskSub}>{item.subject}</Text>
                <Text style={styles.taskTime}>
                  {item.time} {item.category ? `(${item.category})` : ""}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#E8F8F5" }]}
                onPress={() => openConfirm("restore", item.id)}
              >
                <Ionicons name="refresh-outline" size={20} color="#27AE60" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  { backgroundColor: "#FDEDEC", marginLeft: 6 },
                ]}
                onPress={() => openConfirm("delete", item.id)}
              >
                <Ionicons name="trash-bin" size={20} color="#E74C3C" />
              </TouchableOpacity>
            </View>
          ) : activeTab === "completed" ? (
            <View style={[styles.taskCard, { backgroundColor: "#E8F8F5" }]}>
              <View style={{ flex: 1 }}>
                <Text
                  style={[
                    styles.taskTitle,
                    { textDecorationLine: "line-through", color: "#7F8C8D" },
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={styles.taskSub}>{item.subject}</Text>
                <Text style={styles.taskTime}>{item.time}</Text>
              </View>
              {/* Delete icon for completed task */}
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: "#FDEDEC" }]}
                onPress={() => openConfirm("softDeleteCompleted", item.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#E74C3C" />
              </TouchableOpacity>
            </View>
          ) : (
            <Swipeable
              renderRightActions={() =>
                renderRightActions(item.id, item.bg !== "#FFF")
              }
            >
              <TouchableOpacity
                style={[
                  styles.taskCard,
                  {
                    backgroundColor:
                      selectedTaskId === item.id ? "#D4EFDF" : item.bg,
                  },
                ]}
                onPress={() => toggleHighlight(item.id)}
                activeOpacity={0.8}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.taskTitle}>{item.title}</Text>
                  <Text style={styles.taskSub}>{item.subject}</Text>
                  <Text style={styles.taskTime}>{item.time}</Text>
                </View>
              </TouchableOpacity>
            </Swipeable>
          )
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>No tasks yet. Add one!</Text>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Confirmation Modal */}
      <Modal transparent={true} visible={confirmVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons
              name={
                confirmType === "delete"
                  ? "trash-outline"
                  : confirmType === "softDelete" || confirmType === "softDeleteCompleted"
                  ? "trash-outline"
                  : confirmType === "restore"
                  ? "refresh-outline"
                  : "checkmark-done-outline"
              }
              size={40}
              color={
                confirmType === "delete" || confirmType === "softDelete" || confirmType === "softDeleteCompleted"
                  ? "#E74C3C"
                  : "#27AE60"
              }
            />
            <Text style={styles.modalTitle}>
              {confirmType === "delete"
                ? "Delete Permanently?"
                : confirmType === "softDelete" || confirmType === "softDeleteCompleted"
                ? "Move to Deleted?"
                : confirmType === "restore"
                ? "Restore Task?"
                : "Mark as Completed?"}
            </Text>
            <Text style={styles.modalMessage}>
              {confirmType === "delete"
                ? "This action cannot be undone. Are you sure?"
                : confirmType === "softDelete" || confirmType === "softDeleteCompleted"
                ? "This task will be moved to Deleted tab. Continue?"
                : confirmType === "restore"
                ? "Do you want to restore this task back to All tab?"
                : "Do you want to mark this task as completed?"}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#95A5A6" }]}
                onPress={() => setConfirmVisible(false)}
              >
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalBtn,
                  {
                    backgroundColor:
                      confirmType === "delete" ||
                      confirmType === "softDelete" ||
                      confirmType === "softDeleteCompleted"
                        ? "#E74C3C"
                        : "#27AE60",
                  },
                ]}
                onPress={handleConfirm}
              >
                <Text style={styles.modalBtnText}>
                  {confirmType === "delete"
                    ? "Delete"
                    : confirmType === "softDelete" || confirmType === "softDeleteCompleted"
                    ? "Delete"
                    : confirmType === "restore"
                    ? "Restore"
                    : "Complete"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F4F6F8" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 15, marginTop: 30 },
  title: { fontSize: 28, fontWeight: "800", color: "#2C3E50" },
  date: { fontSize: 14, color: "#7F8C8D", marginTop: 2 },
  tabs: { flexDirection: "row", marginBottom: 8 },
  tab: { marginRight: 15, fontSize: 14, color: "#95A5A6" },
  activeTab: { color: "#2C3E50", fontWeight: "700" },
  counter: { fontSize: 15, fontWeight: "500", color: "#2C3E50", marginBottom: 15 },
  inputCard: { backgroundColor: "#FFF", padding: 15, borderRadius: 16, marginBottom: 20 },
  input: { borderWidth: 1, borderColor: "#E0E0E0", padding: 12, borderRadius: 10, marginBottom: 10 },
  addTaskBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#2C3E50", padding: 12, borderRadius: 10, justifyContent: "center" },
  addTaskText: { color: "#FFF", fontWeight: "600", marginLeft: 6, fontSize: 16 },
  taskCard: { flexDirection: "row", alignItems: "center", padding: 18, borderRadius: 18, marginBottom: 12, backgroundColor: "#FFF" },
  taskTitle: { fontSize: 17, fontWeight: "600", color: "#2C3E50" },
  taskSub: { fontSize: 14, color: "#7F8C8D", marginTop: 2 },
  taskTime: { fontSize: 12, color: "#95A5A6", marginTop: 4 },
  completeAction: { justifyContent: "center", alignItems: "center", width: 90, borderRadius: 18, backgroundColor: "#27AE60", marginRight: 5 },
  deleteAction: { justifyContent: "center", alignItems: "center", width: 90, borderRadius: 18, backgroundColor: "#E74C3C" },
  actionText: { color: "#FFF", fontSize: 12, marginTop: 4 },
  actionBtn: { borderRadius: 50, padding: 8, marginLeft: 8 },
  emptyText: { textAlign: "center", marginTop: 30, fontSize: 16, color: "#95A5A6" },
  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { width: "80%", backgroundColor: "#FFF", borderRadius: 16, padding: 20, alignItems: "center" },
  modalTitle: { fontSize: 20, fontWeight: "700", marginVertical: 10 },
  modalMessage: { fontSize: 14, color: "#7F8C8D", textAlign: "center", marginBottom: 20 },
  modalActions: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  modalBtn: { flex: 1, padding: 12, borderRadius: 10, marginHorizontal: 5, alignItems: "center" },
  modalBtnText: { color: "#FFF", fontWeight: "600", fontSize: 15 },
});

export default AddTask;
