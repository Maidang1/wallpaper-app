import { invoke } from '@tauri-apps/api/core';
import { open } from "@tauri-apps/plugin-dialog"
import * as motion from "motion/react-client"

import './App.css';

function App() {
  const handleSelectLocalImage = async () => {

    const file = await open({
      multiple: false,
      filters: [
        {
          name: 'Images',
          extensions: ['png', 'jpg', 'jpeg', 'gif'],
        },
      ],
    });
    if (file) {
      await invoke('set_wallpapar_from_path', { imagePath: file });

    }
  }

  return (
    <main>
      <motion.button
        whileHover={{ scale: 1.2 }}
        whileTap={{ scale: 0.8 }}
        onClick={handleSelectLocalImage}>选取本地图片</motion.button>
    </main>
  );
}

export default App;
