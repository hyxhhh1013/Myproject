import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayArrow, 
  Pause, 
  Replay, 
  CheckCircle, 
  Add, 
  Delete, 
  Settings, 
  Close, 
  Timelapse 
} from '@mui/icons-material';
import { 
  Button, 
  IconButton, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Slider,
  Typography,
  Paper,
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip
} from '@mui/material';

// 自定义 Material UI 主题
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#FF6B6B', // 专注红
    },
    secondary: {
      main: '#4ECDC4', // 休息绿
    },
    background: {
      default: '#f7f9fc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.05em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          padding: '10px 24px',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          boxShadow: '0 10px 40px -10px rgba(0,0,0,0.05)',
        },
      },
    },
  },
});

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

const App = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'focus' | 'short' | 'long'>('focus');
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: '完成项目重构', completed: false },
    { id: '2', title: '编写测试用例', completed: true },
  ]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [customTimes, setCustomTimes] = useState({ focus: 25, short: 5, long: 15 });
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const timerRef = useRef<number | null>(null);

  const MODES = {
    focus: { label: '专注模式', color: '#FF6B6B', bg: '#FFF0F0' },
    short: { label: '短休息', color: '#4ECDC4', bg: '#E0F7FA' },
    long: { label: '长休息', color: '#45B7D1', bg: '#E1F5FE' },
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (mode === 'focus') {
        setCompletedPomodoros(prev => prev + 1);
        new Notification("专注结束", { body: "休息一下吧！" });
      } else {
        new Notification("休息结束", { body: "准备开始新的专注！" });
      }
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isActive, timeLeft, mode]);

  useEffect(() => {
    // 请求通知权限
    if (Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(customTimes[mode] * 60);
  };

  const changeMode = (newMode: 'focus' | 'short' | 'long') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(customTimes[newMode] * 60);
  };

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setTasks([...tasks, { id: Date.now().toString(), title: newTaskTitle, completed: false }]);
    setNewTaskTitle('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    if (activeTaskId === id) setActiveTaskId(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((customTimes[mode] * 60 - timeLeft) / (customTimes[mode] * 60)) * 100;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          transition: 'background-color 0.5s',
          backgroundColor: MODES[mode].bg
        }}
      >
        <Paper 
          elevation={0}
          sx={{ 
            width: '100%', 
            maxWidth: 480, 
            height: '85vh', 
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Header */}
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timelapse sx={{ color: MODES[mode].color }} />
              <Typography variant="h6" fontWeight="bold" color="textPrimary">
                FocusFlow
              </Typography>
            </Box>
            <IconButton onClick={() => setShowSettings(true)}>
              <Settings />
            </IconButton>
          </Box>

          {/* Main Timer Area */}
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            {/* Mode Switcher */}
            <Box sx={{ display: 'flex', gap: 1, mb: 4, bgcolor: 'rgba(0,0,0,0.05)', p: 0.5, borderRadius: 3 }}>
              {Object.keys(MODES).map((m) => (
                <Button
                  key={m}
                  onClick={() => changeMode(m as any)}
                  sx={{ 
                    bgcolor: mode === m ? 'white' : 'transparent',
                    color: mode === m ? MODES[m as keyof typeof MODES].color : 'text.secondary',
                    boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                    minWidth: 80,
                    '&:hover': { bgcolor: mode === m ? 'white' : 'rgba(0,0,0,0.05)' }
                  }}
                >
                  {MODES[m as keyof typeof MODES].label}
                </Button>
              ))}
            </Box>

            {/* Timer Circle */}
            <Box sx={{ position: 'relative', width: 280, height: 280, display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
              <svg width="280" height="280" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="140" cy="140" r="130" fill="none" stroke="#eee" strokeWidth="8" />
                <motion.circle
                  cx="140" cy="140" r="130"
                  fill="none"
                  stroke={MODES[mode].color}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray="816"
                  animate={{ strokeDashoffset: 816 - (816 * progress) / 100 }}
                  transition={{ duration: 1, ease: "linear" }}
                />
              </svg>
              <Box sx={{ position: 'absolute', textAlign: 'center' }}>
                <Typography variant="h1" sx={{ color: MODES[mode].color, fontSize: '5rem', lineHeight: 1 }}>
                  {formatTime(timeLeft)}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 1, letterSpacing: 2, textTransform: 'uppercase' }}>
                  {isActive ? '专注中' : '已暂停'}
                </Typography>
              </Box>
            </Box>

            {/* Controls */}
            <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
              <IconButton 
                onClick={toggleTimer}
                sx={{ 
                  width: 64, height: 64, 
                  bgcolor: MODES[mode].color, 
                  color: 'white',
                  '&:hover': { bgcolor: MODES[mode].color, filter: 'brightness(0.9)' },
                  boxShadow: '0 8px 20px -4px rgba(0,0,0,0.2)'
                }}
              >
                {isActive ? <Pause fontSize="large" /> : <PlayArrow fontSize="large" />}
              </IconButton>
              <IconButton 
                onClick={resetTimer}
                sx={{ width: 64, height: 64, bgcolor: 'action.hover' }}
              >
                <Replay fontSize="large" />
              </IconButton>
            </Box>
          </Box>

          {/* Tasks Section */}
          <Paper 
            elevation={0} 
            sx={{ 
              bgcolor: '#fafafa', 
              borderTopLeftRadius: 32, 
              borderTopRightRadius: 32, 
              p: 3,
              flex: '0 0 auto',
              maxHeight: '35vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>待办清单</span>
              <span>已完成: {completedPomodoros}</span>
            </Typography>

            <form onSubmit={addTask} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <TextField 
                fullWidth 
                placeholder="添加新任务..." 
                variant="outlined" 
                size="small"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                sx={{ bgcolor: 'white' }}
              />
              <IconButton type="submit" sx={{ bgcolor: MODES[mode].color, color: 'white', '&:hover': { bgcolor: MODES[mode].color } }}>
                <Add />
              </IconButton>
            </form>

            <List sx={{ overflow: 'auto', flex: 1 }}>
              <AnimatePresence>
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <ListItem 
                      dense
                      button
                      onClick={() => setActiveTaskId(task.id)}
                      sx={{ 
                        bgcolor: activeTaskId === task.id ? 'white' : 'transparent',
                        borderRadius: 2,
                        mb: 1,
                        border: activeTaskId === task.id ? `1px solid ${MODES[mode].color}` : '1px solid transparent'
                      }}
                    >
                      <IconButton onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }} size="small" sx={{ mr: 1 }}>
                        <CheckCircle sx={{ color: task.completed ? '#4CAF50' : '#e0e0e0' }} />
                      </IconButton>
                      <ListItemText 
                        primary={task.title} 
                        sx={{ textDecoration: task.completed ? 'line-through' : 'none', opacity: task.completed ? 0.6 : 1 }} 
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" size="small" onClick={() => deleteTask(task.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </motion.div>
                ))}
              </AnimatePresence>
            </List>
          </Paper>

          {/* Settings Dialog */}
          <Dialog open={showSettings} onClose={() => setShowSettings(false)} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              设置
              <IconButton onClick={() => setShowSettings(false)} size="small"><Close /></IconButton>
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>专注时长: {customTimes.focus} 分钟</Typography>
                <Slider 
                  value={customTimes.focus} 
                  min={5} max={60} step={5}
                  onChange={(_, v) => setCustomTimes({ ...customTimes, focus: v as number })}
                  sx={{ color: MODES.focus.color }}
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>短休息: {customTimes.short} 分钟</Typography>
                <Slider 
                  value={customTimes.short} 
                  min={1} max={15}
                  onChange={(_, v) => setCustomTimes({ ...customTimes, short: v as number })}
                  sx={{ color: MODES.short.color }}
                />
              </Box>
              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom>长休息: {customTimes.long} 分钟</Typography>
                <Slider 
                  value={customTimes.long} 
                  min={5} max={45} step={5}
                  onChange={(_, v) => setCustomTimes({ ...customTimes, long: v as number })}
                  sx={{ color: MODES.long.color }}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 3 }}>
              <Button onClick={() => setShowSettings(false)} fullWidth variant="contained" sx={{ bgcolor: 'black', color: 'white', '&:hover': { bgcolor: '#333' } }}>
                完成
              </Button>
            </DialogActions>
          </Dialog>

        </Paper>
      </Box>
    </ThemeProvider>
  );
};

export default App;
