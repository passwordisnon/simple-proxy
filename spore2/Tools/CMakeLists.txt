cmake_minimum_required(VERSION 3.16)
project(spore2_tools CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
if(NOT CMAKE_BUILD_TYPE)
  set(CMAKE_BUILD_TYPE Release)
endif()

# The same sources the Unreal plugin compiles.
set(CORE_DIR ${CMAKE_CURRENT_SOURCE_DIR}/../Plugins/Spore2Interop/Source/Spore2Interop)
add_library(sporecore STATIC
  ${CORE_DIR}/Private/SporeCore/SporeDbpf.cpp
  ${CORE_DIR}/Private/SporeCore/SporePng.cpp
  ${CORE_DIR}/Private/SporeCore/SporeProp.cpp
  ${CORE_DIR}/Private/SporeCore/SporeTextureGen.cpp)
target_include_directories(sporecore PUBLIC ${CORE_DIR}/Public)
if(CMAKE_CXX_COMPILER_ID MATCHES "GNU|Clang")
  target_compile_options(sporecore PRIVATE -Wall -Wextra -Wshadow -fno-exceptions)
endif()

find_package(ZLIB REQUIRED)
add_executable(spore2-scan spore2-scan/main.cpp)
target_link_libraries(spore2-scan PRIVATE sporecore ZLIB::ZLIB)

enable_testing()
add_executable(spore2-tests ../Tests/test_core.cpp)
target_link_libraries(spore2-tests PRIVATE sporecore)
add_test(NAME spore2-tests COMMAND spore2-tests)
