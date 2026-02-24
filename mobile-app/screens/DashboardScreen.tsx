import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCountUp } from '../utils/useCountUp'; // өмнөх message-д өгсөн hook

// Симуляци data (backendгүй учраас түр утга)
const simulatedUser = {
  username: 'Хүслэн',
  user_type: 'student',
};

const simulatedGrades = [
  { id: 1, number: 5, subjects: [{ id: 101, name: 'Математик', question_count: 45, total_points: 450 }] },
  { id: 2, number: 7, subjects: [{ id: 201, name: 'Монгол хэл', question_count: 38, total_points: 380 }] },
  { id: 3, number: 10, subjects: [{ id: 301, name: 'Физик', question_count: 52, total_points: 520 }] },
];

const simulatedLeaderboard = [
  { student_name: 'Бат', total_points: 2850 },
  { student_name: 'Сувд', total_points: 2720 },
  { student_name: 'Эрдэнэ', total_points: 2590 },
];

const simulatedWeakQuestions = [
  { question_text: 'Монголын нийслэл хаана байдаг вэ?', wrong_count: 7, total_attempts: 12 },
  { question_text: '2 + 2 хэд вэ?', wrong_count: 5, total_attempts: 20 },
];

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [userType] = useState<'teacher' | 'student'>('student'); // туршилтын зорилгоор
  const [currentUser] = useState(simulatedUser);
  const [grades] = useState(simulatedGrades);
  const [loading] = useState(false);
  const [currentView] = useState<'grades' | 'quiz' | 'result' | 'add-question'>('grades');
  const [selectedGradeForSubjects, setSelectedGradeForSubjects] = useState<number | null>(null);
  const [gradeFilter, setGradeFilter] = useState<'prep' | 'middle' | 'high' | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showMyWeaknesses, setShowMyWeaknesses] = useState(false);

  const totalPoints = 1420; // симуляци
  const animatedPoints = useCountUp(totalPoints, 1200);

  const handleLogout = () => {
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Ачаалж байна...</Text>
      </View>
    );
  }

  const { width } = Dimensions.get('window');

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Brainova</Text>
        <View style={styles.userSection}>
          <View>
            <Text style={styles.username}>{currentUser.username}</Text>
            <Text style={styles.userTypeLabel}>
              {userType === 'teacher' ? 'Багш' : 'Сурагч'}
            </Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Гарах</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Student-д зориулсан онооны карт */}
      {userType === 'student' && (
        <TouchableOpacity
          style={styles.pointsCard}
          onPress={() => setShowMyWeaknesses(!showMyWeaknesses)}
        >
          <Text style={styles.pointsLabel}>Нийт оноо</Text>
          <Text style={styles.pointsValue}>
            {animatedPoints} <Text style={styles.trophy}>🏆</Text>
          </Text>
        </TouchableOpacity>
      )}

      {/* Leaderboard toggle */}
      <TouchableOpacity
        style={styles.toggleBtn}
        onPress={() => setShowLeaderboard(!showLeaderboard)}
      >
        <Text style={styles.toggleText}>
          Leaderboard {showLeaderboard ? 'нуух' : 'харуулах'}
        </Text>
      </TouchableOpacity>

      {showLeaderboard && (
        <View style={[styles.card, { borderColor: '#fbbf24' }]}>
          <Text style={[styles.cardTitle, { color: '#ca8a04' }]}>Top 10 Сурагч</Text>
          {simulatedLeaderboard.map((item, i) => (
            <View key={i} style={styles.listRow}>
              <Text style={styles.listName}>{item.student_name}</Text>
              <Text style={styles.listPoints}>{item.total_points} 🏆</Text>
            </View>
          ))}
        </View>
      )}

      {/* Миний сул тал */}
      {showMyWeaknesses && userType === 'student' && (
        <View style={[styles.card, { borderColor: '#ef4444', borderWidth: 3 }]}>
          <Text style={[styles.cardTitle, { color: '#ef4444' }]}>Миний алдаанууд</Text>
          {simulatedWeakQuestions.length === 0 ? (
            <Text style={styles.emptyMessage}>Одоогоор алдаа алга! 🎉</Text>
          ) : (
            simulatedWeakQuestions.map((q, i) => (
              <View key={i} style={styles.weakCard}>
                <Text style={styles.weakQuestion}>{q.question_text}</Text>
                <Text style={styles.wrongCount}>
                  {q.wrong_count} удаа буруу ({Math.round((q.wrong_count / q.total_attempts) * 100)}%)
                </Text>
              </View>
            ))
          )}
        </View>
      )}

      {/* GRADE / SUBJECTS VIEW */}
      {currentView === 'grades' && (
        <>
          <Text style={styles.bigTitle}>
            {userType === 'teacher' ? 'Миний хариуцдаг хичээлүүд' : 'Анги сонгоно уу'}
          </Text>

          {/* Grade filter buttons */}
          {!selectedGradeForSubjects && (
            <View style={styles.filterRow}>
              {['prep', 'middle', 'high'].map(filter => (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterBtn,
                    gradeFilter === filter && styles.filterBtnActive,
                  ]}
                  onPress={() => setGradeFilter(filter as any)}
                >
                  <Text style={[
                    styles.filterText,
                    gradeFilter === filter && { color: 'white' },
                  ]}>
                    {filter === 'prep' ? 'Бэлтгэл (1-5)' :
                     filter === 'middle' ? 'Дунд (6-9)' : 'Ахлах (10-12)'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Grade cards */}
          <View style={styles.grid}>
            {grades
              .filter(g => {
                if (!gradeFilter) return true;
                if (gradeFilter === 'prep') return g.number <= 5;
                if (gradeFilter === 'middle') return g.number >= 6 && g.number <= 9;
                if (gradeFilter === 'high') return g.number >= 10;
                return false;
              })
              .map(grade => (
                <TouchableOpacity
                  key={grade.id}
                  style={styles.gradeCard}
                  onPress={() => setSelectedGradeForSubjects(grade.id)}
                >
                  <Text style={styles.gradeNumber}>{grade.number}-р анги</Text>
                  <Text style={styles.gradeSubjects}>
                    {grade.subjects.length} хичээл
                  </Text>
                </TouchableOpacity>
              ))}
          </View>
        </>
      )}

      {/* Бусад view-үүд (quiz, add-question г.м) дараа нэмж болно */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3e8ff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontSize: 18, color: '#8b5cf6' },

  header: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    margin: 16,
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 6,
  },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#7c3aed' },
  userSection: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  username: { fontSize: 20, fontWeight: 'bold' },
  userTypeLabel: { fontSize: 16, color: '#666' },
  logoutBtn: { backgroundColor: '#ef4444', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 12 },
  logoutText: { color: 'white', fontWeight: 'bold' },

  pointsCard: {
    backgroundColor: '#fbbf24',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    elevation: 8,
  },
  pointsLabel: { fontSize: 18, color: '#7c2d12', marginBottom: 8 },
  pointsValue: { fontSize: 48, fontWeight: 'bold', color: 'white' },
  trophy: { fontSize: 40 },

  toggleBtn: {
    backgroundColor: '#facc15',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 4,
  },
  toggleText: { fontSize: 20, fontWeight: 'bold' },

  card: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 20,
    elevation: 4,
    borderWidth: 2,
  },
  cardTitle: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  listName: { fontSize: 18 },
  listPoints: { fontSize: 18, fontWeight: 'bold', color: '#ca8a04' },

  weakCard: {
    backgroundColor: '#fee2e2',
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
  },
  weakQuestion: { fontSize: 18, fontWeight: '600' },
  wrongCount: { color: '#ef4444', fontSize: 16, marginTop: 4 },

  bigTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#7c3aed',
    textAlign: 'center',
    marginVertical: 20,
  },

  filterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  filterBtn: {
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#a78bfa',
    elevation: 3,
  },
  filterBtnActive: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  filterText: { fontSize: 18, fontWeight: 'bold', color: '#7c3aed' },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  gradeCard: {
    backgroundColor: 'white',
    width: '45%',
    margin: 8,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    elevation: 5,
    borderWidth: 2,
    borderColor: '#c4b5fd',
  },
  gradeNumber: { fontSize: 40, fontWeight: 'bold', color: '#7c3aed' },
  gradeSubjects: { fontSize: 18, color: '#666', marginTop: 8 },

  emptyMessage: { fontSize: 22, color: '#666', textAlign: 'center', padding: 40 },
});