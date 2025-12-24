import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const NotesMiniDemo = () => {
  const [text, setText] = useState('# Hello\n* Type here...\n* See preview!');

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-800 flex flex-col border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1 p-2 text-xs font-bold text-gray-500 bg-gray-100 dark:bg-gray-900">Editor</div>
        <div className="flex-1 p-2 text-xs font-bold text-gray-500 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">Preview</div>
      </div>
      <div className="flex-1 flex">
        <textarea 
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 p-3 text-xs font-mono resize-none focus:outline-none bg-gray-50 dark:bg-gray-900 dark:text-gray-300"
        />
        <div className="flex-1 p-3 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto prose prose-sm dark:prose-invert">
          <ReactMarkdown>{text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default NotesMiniDemo;
