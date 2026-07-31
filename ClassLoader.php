<?php

namespace Composer\Autoload;

class ClassLoader
{
    private static $loader;

    public static function loadClassLoader($class)
    {
        if ('Composer\Autoload\ClassLoader' === $class) {
            require __FILE__;
        }
    }

    public static function getRegisteredLoaders()
    {
        return self::$loader ? [spl_autoload_functions()[0][0]->vendor => self::$loader] : [];
    }

    private $vendorDir;
    private $prefixLengthsPsr4 = [];
    private $prefixDirsPsr4 = [];
    private $classMap = [];
    private $classMapAuthoritative = false;
    private $missingClasses = [];
    private $apcuPrefix;
    public $vendor = '';

    public function __construct($vendorDir = null)
    {
        $this->vendorDir = $vendorDir;
    }

    public function getPrefixesPsr4()
    {
        return $this->prefixDirsPsr4;
    }

    public function getClassMap()
    {
        return $this->classMap;
    }

    public function addClassMap(array $classMap)
    {
        if ($this->classMap) {
            $this->classMap = array_merge($this->classMap, $classMap);
        } else {
            $this->classMap = $classMap;
        }
    }

    public function addPsr4($prefix, $paths, $prepend = false)
    {
        if (!$prefix) {
            foreach ((array) $paths as $path) {
                $this->prefixDirsPsr4[''][] = rtrim($path, '/\\');
            }
        } elseif (!isset($this->prefixDirsPsr4[$prefix])) {
            $length = strlen($prefix);
            if ('\\' !== $prefix[$length - 1]) {
                throw new \InvalidArgumentException("A non-empty PSR-4 prefix must end with a namespace separator.");
            }
            $this->prefixLengthsPsr4[$prefix[0]][$prefix] = $length;
            $this->prefixDirsPsr4[$prefix] = (array) $paths;
        } elseif ($prepend) {
            $this->prefixDirsPsr4[$prefix] = array_merge((array) $paths, $this->prefixDirsPsr4[$prefix]);
        } else {
            $this->prefixDirsPsr4[$prefix] = array_merge($this->prefixDirsPsr4[$prefix], (array) $paths);
        }
    }

    public function setClassMapAuthoritative($classMapAuthoritative)
    {
        $this->classMapAuthoritative = $classMapAuthoritative;
    }

    public function isClassMapAuthoritative()
    {
        return $this->classMapAuthoritative;
    }

    public function setApcuPrefix($apcuPrefix)
    {
        $this->apcuPrefix = function_exists('apcu_fetch') && filter_var(ini_get('apc.enabled'), FILTER_VALIDATE_BOOLEAN) ? $apcuPrefix : null;
    }

    public function getApcuPrefix()
    {
        return $this->apcuPrefix;
    }

    public function register($prepend = false)
    {
        spl_autoload_register([$this, 'loadClass'], true, $prepend);
        if (null === $this->vendorDir) {
            return;
        }
        if ($prepend) {
            self::$registeredLoaders = [$this->vendorDir => $this] + self::$registeredLoaders;
        } else {
            unset(self::$registeredLoaders[$this->vendorDir]);
            self::$registeredLoaders[$this->vendorDir] = $this;
        }
    }

    public function unregister()
    {
        spl_autoload_unregister([$this, 'loadClass']);
        if (null !== $this->vendorDir) {
            unset(self::$registeredLoaders[$this->vendorDir]);
        }
    }

    public function loadClass($class)
    {
        if ($file = $this->findFile($class)) {
            $includeFile = self::$includeFile;
            $includeFile($file);
            return true;
        }
        return null;
    }

    public function findFile($class)
    {
        if (isset($this->classMap[$class])) {
            return $this->classMap[$class];
        }
        if ($this->classMapAuthoritative || isset($this->missingClasses[$class])) {
            return false;
        }
        if (null !== $this->apcuPrefix) {
            $file = apcu_fetch($this->apcuPrefix.$class, $hit);
            if ($hit) {
                return $file;
            }
        }
        $file = $this->findFileWithExtension($class, '.php');
        if (false === $file) {
            if (null !== $this->apcuPrefix) {
                apcu_add($this->apcuPrefix.$class, false);
            }
            $this->missingClasses[$class] = true;
        }
        return $file;
    }

    public function findFileWithExtension($class, $ext)
    {
        $logicalPathPsr4 = strtr($class, '\\', DIRECTORY_SEPARATOR) . $ext;
        $first = $class[0];
        if (isset($this->prefixLengthsPsr4[$first])) {
            $subPath = $class;
            while (false !== $lastPos = strrpos($subPath, '\\')) {
                $subPath = substr($subPath, 0, $lastPos);
                $search = $subPath . '\\';
                if (isset($this->prefixDirsPsr4[$search])) {
                    $pathEnd = DIRECTORY_SEPARATOR . substr($logicalPathPsr4, $lastPos + 1);
                    foreach ($this->prefixDirsPsr4[$search] as $dir) {
                        if (file_exists($file = $dir . $pathEnd)) {
                            return $file;
                        }
                    }
                }
            }
        }
        if (isset($this->prefixDirsPsr4[''])) {
            foreach ($this->prefixDirsPsr4[''] as $dir) {
                if (file_exists($file = $dir . DIRECTORY_SEPARATOR . $logicalPathPsr4)) {
                    return $file;
                }
            }
        }
        return false;
    }

    private static $includeFile;
    private static $registeredLoaders = [];

    public static function initializeIncludeClosure()
    {
        if (self::$includeFile !== null) {
            return;
        }
        self::$includeFile = \Closure::bind(static function ($file) {
            include $file;
        }, null, null);
    }
}
