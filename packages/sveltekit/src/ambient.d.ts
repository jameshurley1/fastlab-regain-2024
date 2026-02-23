type Mailer = {
  email: string;
  service: string;
  host: string;
  port: number;
  username: string;
  password: string;
};

type UserExercise = {
  exerciseId: string;
  targetReps: number;
};

type User = {
  id: string;
  email: string;
  onboard: boolean;
  overallProgress: number;
  groups: Group[];
  exercises: UserExercise[];
  createdAt: string;
  updatedAt: string;
};

type UserStats = {
  id: string;
  userId: string;
  statId: string;
  createdAt: string;
  updatedAt: string;
}

type Group = {
  id: string;
  area: string;
  users: User[];
  exercises: Exercise[];
  createdAt: string;
  updatedAt: string;
}

type GroupExercises = {
  id: string;
  groupId: string;
  exerciseId: string;
  createdAt: string;
  updatedAt: string;
}

type UserGroups = {
  id: string;
  userId: string;
  groupId: string;
  createdAt: string;
  updatedAt: string;
}

type Area = {
  id: string;
  name: string;
  status: boolean;
}

type Exercise = {
  id: string;
  title: string;
  time: number;
  description?: string;
  imageKey: string;
  videoKey: string;
  image?: string;
  video?: string;
  createdAt: string;
  updatedAt: string;
}

type Stat = {
  id: string;
  userId: string;
  exerciseId: string;
  pain: number;
  complexity: number;
  comments: string;
}

type Error = {
  status: boolean;
  message: string;
}

type Session = {
  id: string;
  userId: string;
  exerciseId: string;
  repsCompleted: number;
  videoCompleted: boolean;
  date: string;
};

type Information = {
  stayOn: boolean;
  closeIcon: boolean;
  message: string;
  buttons?: Button[];
}

type Button = {
  title: string;
  result: string;
}

type UserToken = {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

type AppSyncEvent = {
  info: {
    fieldName: string;
  };
  arguments: {
    user: User;
    userId: string;
  };
};
