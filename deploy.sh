#!/bin/bash

while [[ "$#" -gt 0 ]]; do
    case $1 in
        -h|--help) 
            echo "Usage: bash.sh [en|zh|all|show <en|zh>|-h]"
            echo "Options:"
            echo "  [deploy|d] en   Deploy English configuration to GitHub Pages"
            echo "  [deploy|d] zh   Deploy Chinese configuration to GitHub Pages"
            echo "  [deploy|d] all  Deploy both English and Chinese configurations to GitHub Pages"
            echo "  [show|s] en     Execute npm run show for English configuration"
            echo "  [show|s] zh     Execute npm run show for Chinese configuration"
            echo "  -h, --help      Display this help message"
            exit 0
            ;;
        d | deploy)
            lang=$2
            if [ "$lang" = "en" ] || [ "$lang" = "zh" ]; then
                cp "config-$lang.yml" _config.yml
                cp "config-butterfly-$lang.yml" "_config.butterfly.yml"
                npm run kk
                echo "Deploy $1 success!"
            elif [ "$lang" = "all" ]; then
                for lang_choice in "zh" "en"; do
                    cp "config-$lang_choice.yml" _config.yml
                    cp "config-butterfly-$lang_choice.yml" "_config.butterfly.yml"
                    npm run kk
                    echo "Deploy $lang_choice success!"
                done
            else
                echo "Error! Please input 'en' or 'zh' or 'all'!"
            fi
            ;;
        s | show)
            lang=$2
            if [ "$lang" = "en" ] || [ "$lang" = "zh" ]; then
                cp "config-$lang.yml" _config.yml
                cp "config-butterfly-$lang.yml" "_config.butterfly.yml"
                npm run show
                echo "Running npm show!"
            else
                echo "Error! Please use './bash.sh show en' or './bash.sh show zh'!"
            fi
            shift # Move to the next argument after 'show'
            ;;
        *)
            echo "Error! Please input deploy <en|zh|all> or 'show <en|zh>' or '-h' for help!"
            exit 1
            ;;
    esac
    shift
done