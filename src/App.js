import React, { useCallback, useState, useEffect } from 'react';
import { StatusBar, Dimensions } from 'react-native';
import styled, { ThemeProvider } from 'styled-components/native';
import { theme } from './theme';
import Input from './components/Input';
import Task from './components/Task';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${({ theme }) => theme.background};
  align-items: center;
  justify-content: flex-start;
`;
const Title = styled.Text`
  font-size: 40px;
  font-weight: 600;
  color: ${({ theme }) => theme.main};
  align-self: flex-start;
  margin: 0px 20px; /* y축 x축 */
`;

const List = styled.ScrollView`
  flex: 1;
  width: ${({ width }) => width - 40}px;
`;
// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const App = () => {
  const width = Dimensions.get('window').width;

  //162 page
  //텍스트 입력의 내용 크기가 변경되면 호출되는 콜백
  const [isReady, setIsReady] = useState(false);
  const [newTask, setNewTask] = useState(''); // 초기값 지정
  const [tasks, setTasks] = useState({});

  // 저장하기
  const _saveTasks = async tasks => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      setTasks(tasks);
    } catch (e) {
      console.error(e);
    }
  };

  // 불러오기
  const _loadTasks = async () => {
    const loadedTasks = await AsyncStorage.getItem('tasks');
    setTasks(JSON.parse(loadedTasks || '{}'));
  };
  // 데이터불러오기
  useEffect(() => {
    async function prepare() {
      try {
        await _loadTasks();
      } catch (e) {
        console.error(e);
      } finally {
        setIsReady(true);
      }
    }

    prepare();
  }, []);
  const onLayoutRootView = useCallback(async () => {
    if (isReady) {
      await SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!setIsReady) {
    return null;
  }

  // 추가
  const _addTask = () => {
    const ID = Date.now().toString();
    const newTaskObject = {
      [ID]: { id: ID, text: newTask, completed: false },
    };
    // alert(`Add: ${newTask}`);
    setNewTask('');
    _saveTasks({ ...tasks, ...newTaskObject });
  };
  // 삭제
  // const _deleteTask = id => {
  //   const currentTasks = Object.assign({}, tasks);
  //   delete currentTasks[id];
  //   _saveTasks(currentTasks);
  // };
  const _deleteTask = id => {
    const currentTasks = { ...tasks }; //Object.assign({},tasks);
    Alert.alert('', '삭제하시겠습니까?', [
      {
        text: '아니오',
        onPress() {
          console.log('아니오');
        },
      },
      {
        text: '예',
        onPress() {
          console.log('예');
          delete currentTasks[id];
          _saveTasks(currentTasks);
        },
      },
    ]);
  };

  //완료
  const _toggleTask = id => {
    const currentTasks = Object.assign({}, tasks);
    currentTasks[id]['completed'] = !currentTasks[id]['completed'];
    _saveTasks(currentTasks);
  };

  // 수정
  const _updateTask = item => {
    const currentTasks = { ...tasks };
    currentTasks[item.id] = item;
    _saveTasks(currentTasks);
  };
  // 변경값 저장
  const _handleTextChange = text => {
    setNewTask(text);
    // console.log(`변경된 문자열 : ${newTask}`);
  };
  const _onBlur = () => {
    setNewTask('');
  };

  return (
    <ThemeProvider theme={theme}>
      <Container onLayout={onLayoutRootView}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={theme.background}
        />
        <Title>TODO List</Title>
        <Input
          value={newTask}
          placeholder="+ Add a Task"
          onChangeText={_handleTextChange} //수정시
          onSubmitEditing={_addTask} //완료버튼
          onBlur={_onBlur} //포커스 잃었을때
        />
        <List width={width}>
          {Object.values(tasks)
            .reverse()
            .map(item => (
              <Task
                key={item.id}
                item={item}
                deleteTask={_deleteTask}
                toggleTask={_toggleTask}
                updateTask={_updateTask}
              />
            ))}
        </List>
      </Container>
    </ThemeProvider>
  );
};

export default App;
