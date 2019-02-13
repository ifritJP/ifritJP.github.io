(require 'package)
(setq package-archives ())
(add-to-list 'package-archives '("melpa" . "http://melpa.milkbox.net/packages/"))
(add-to-list 'package-archives '("marmalade" . "http://marmalade-repo.org/packages/"))
(add-to-list 'package-archives '("melpa-stable" . "https://stable.melpa.org/packages/") t)

(fset 'package-desc-vers 'package--ac-desc-version)
(package-initialize)


;;;jedi
(jedi:setup)
(define-key jedi-mode-map(kbd "<C-tab>") nil)
;;C-tabはウィンドウの移動に用いる
(setq jedi:complete-on-dot t)
(setq ac-sources
 (delete 'ac-source-words-in-same-mode-buffers ac-sources))
;;jediの補完候補だけでいい
(add-to-list 'ac-sources 'ac-source-filename)
(add-to-list 'ac-sources 'ac-source-jedi-direct)

;; (define-key python-mode-map "\C-ct" 'jedi: goto-definition)
;; (define-key python-mode-map "\C-cb" 'jedi: goto-definition-pop-marker)
;; (define-key python-mode-map "\C-cr" 'helm-jedi-related-names)


;;; py-autopep8
(require 'py-autopep8)
(setq py-autopep8-options '("--max-line-length=100"))
(setq flycheck-flake8-maximum-line-length 100)
;; (py-autopep8-enable-on-save)
(add-hook 'python-mode-hook 'py-autopep8-enable-on-save)


;; ;;; pyflakes
(require 'flymake-python-pyflakes)
(add-hook 'python-mode-hook 'flymake-python-pyflakes-load)
;; (flymake-mode t)
;; ;;;errorやwarningを表示する
;; (require 'flymake-python-pyflakes)
;; (flymake-python-pyflakes-load)
