(function() {
  'use strict';

  if (!navigator.clipboard) {
    return;
  }

  function createCopyButton(codeBlock) {
    const button = document.createElement('button');
    button.className = 'copy-code-button';
    button.type = 'button';
    button.ariaLabel = 'Copy code to clipboard';
    
    // SVG icon for copy
    button.innerHTML = `
      <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      <span class="copy-text">Copy</span>
    `;

    button.addEventListener('click', async () => {
      // Get the code text. 
      // If Hugo uses tables for line numbers, we need to be careful.
      // Usually, the code is in a <td> with class 'lntd' or simply inside <code>.
      let text = '';
      const pre = codeBlock.querySelector('pre');
      const table = codeBlock.querySelector('.lntable');
      
      if (table) {
        // Line numbers are in the first .lntd, code is in the last .lntd
        const codeTd = table.querySelector('.lntd:last-child');
        if (codeTd) {
           text = codeTd.innerText;
        }
      } else if (pre) {
        text = pre.innerText;
      } else {
        // Fallback for non-standard structures, but exclude the button text
        const clone = codeBlock.cloneNode(true);
        const buttonInClone = clone.querySelector('.copy-code-button');
        if (buttonInClone) buttonInClone.remove();
        text = clone.innerText;
      }

      try {
        await navigator.clipboard.writeText(text);
        
        // Success feedback
        button.classList.add('copied');
        button.querySelector('.copy-text').innerText = 'Copied!';
        button.querySelector('.copy-icon').innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;

        setTimeout(() => {
          button.classList.remove('copied');
          button.querySelector('.copy-text').innerText = 'Copy';
          button.querySelector('.copy-icon').innerHTML = `
            <svg class="copy-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          `;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    });

    return button;
  }

  function init() {
    // Hugo Chroma wraps code in .highlight
    const codeBlocks = document.querySelectorAll('.highlight');
    
    codeBlocks.forEach(block => {
      // Ensure the block is positioned relative so the button can be absolute
      block.style.position = 'relative';
      
      const button = createCopyButton(block);
      block.appendChild(button);
    });
    
    // Also handle lonely pre elements if any
    const lonelyPres = document.querySelectorAll('pre:not(.highlight pre)');
    lonelyPres.forEach(pre => {
        if (pre.parentNode.classList.contains('highlight')) return;
        
        pre.style.position = 'relative';
        const button = createCopyButton(pre);
        pre.appendChild(button);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
