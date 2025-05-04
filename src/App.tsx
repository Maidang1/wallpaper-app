import { invoke } from '@tauri-apps/api/core';
import { open } from "@tauri-apps/plugin-dialog"

import './App.css';

function App() {

  async function setWallpaper() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    await invoke('set_wallpapar_from_path');
  }

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
    <main className='container'>
      <button onClick={setWallpaper}>set wallpaper</button>

      <button onClick={handleSelectLocalImage}>选取本地图片</button>
    </main>
  );
}

export default App;
