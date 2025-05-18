#include <iostream>
#include <thread>
#include <chrono>
#include <cstdlib>

const int beepIntervalSeconds = 5;

void playBeepSound() {
    system("afplay /System/Library/Sounds/Basso.aiff");
}

void beepEveryInterval() {
    while (true) {
        auto start = std::chrono::steady_clock::now();
        
        // Play beep sound
        playBeepSound();
        
        auto end = std::chrono::steady_clock::now();
        auto elapsed = std::chrono::duration_cast<std::chrono::seconds>(end - start).count();
        
        // Wait for the remaining time to complete the interval
        std::this_thread::sleep_for(std::chrono::seconds(beepIntervalSeconds - elapsed));
    }
}

int main() {
    // std::cout << "Program will beep every " << beepIntervalSeconds << " seconds." << std::endl;
    // beepEveryInterval();
    playBeepSound();
    return 0;
}
// compile
// g++ -o beep beep.cpp
// run
// ./beep