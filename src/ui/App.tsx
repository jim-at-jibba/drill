import React from "react";
import {Text} from "ink";
import {resolveBaseDir} from "../utils/config";

const App: React.FC = () => {
  const baseDir = resolveBaseDir();
  return <Text>drill base dir: {baseDir}</Text>;
};

export default App;
