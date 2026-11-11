import json
import sys
from pathlib import Path

# Add backend to sys.path
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))
from mock_generator import MockGenerator

def test_mock_generator_zone_density():
    gen = MockGenerator("test_event")
    data_safe = gen.generate_zone_density("zone_north", 1.0)
    assert "currentDensity" in data_safe
    assert data_safe["status"] in ("SAFE", "WARNING", "CRITICAL")
    assert "timestamp" in data_safe

def test_mock_generator_concession_wait():
    gen = MockGenerator("test_event")
    data = gen.generate_concession_wait("vendor_north_7", 1)
    assert "estimatedWaitTime" in data
    assert data["estimatedWaitTime"] >= 0
    assert "waitTrend" in data

def test_hardware_sketch_presence():
    sketch = Path("hardware/esp32_node.ino")
    assert sketch.exists()
    content = sketch.read_text()
    assert "setup()" in content
    assert "loop()" in content

def test_package_json():
    pkg = json.loads(Path("package.json").read_text())
    assert "name" in pkg
    assert "scripts" in pkg
